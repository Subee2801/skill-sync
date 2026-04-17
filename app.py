import os
import csv
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify, render_template, make_response
from flask_cors import CORS

from parser import parse_resume
from tfidf import TFIDFVectorizer
from scorer import cosine_similarity, match_skills, rank_candidates, boost_score
from model import ResumeMatcherModel
from questions import get_interview_questions

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

vectorizer = TFIDFVectorizer()
model = ResumeMatcherModel()


def _parse_boost_keywords(raw_keywords):
    if not raw_keywords:
        return []
    return [k.strip().lower() for k in raw_keywords.split(",") if k.strip()]


def _get_resume_files():
    files = request.files.getlist("resumes[]")
    if not files:
        files = request.files.getlist("resumes")
    return [f for f in files if f and f.filename]


def _extract_csv_candidate_rows(csv_path, filename):
    candidates = []
    try:
        with open(csv_path, "r", encoding="utf-8", errors="ignore", newline="") as csv_file:
            reader = csv.DictReader(csv_file)
            for idx, row in enumerate(reader, start=1):
                if not row:
                    continue
                row_keys = {str(k).strip().lower(): k for k in row.keys() if k}
                name_key = row_keys.get("name")
                email_key = row_keys.get("email")
                phone_key = row_keys.get("phone")
                skills_key = row_keys.get("skills")
                exp_key = row_keys.get("experience")

                values = list(row.values())
                name = (row.get(name_key, "") if name_key else (values[0] if values else "")).strip() or f"CSV Candidate {idx}"
                email = (row.get(email_key, "") if email_key else "").strip() or "Not found"
                phone = (row.get(phone_key, "") if phone_key else "").strip() or "Not found"
                skills_text = (row.get(skills_key, "") if skills_key else "").strip()
                experience_text = (row.get(exp_key, "") if exp_key else "").strip()

                combined_text_chunks = [skills_text, experience_text]
                for cell in values:
                    text = str(cell).strip()
                    if text and text not in combined_text_chunks:
                        combined_text_chunks.append(text)
                raw_text = " ".join([chunk for chunk in combined_text_chunks if chunk]).strip()
                if not raw_text:
                    raw_text = " ".join(str(v).strip() for v in values if str(v).strip())

                candidates.append(
                    {
                        "raw_text": raw_text,
                        "name": name,
                        "email": email,
                        "phone": phone,
                        "filename": f"{filename}#row{idx}",
                    }
                )
    except Exception:
        return []
    return candidates


def _analyze_internal(force_boost=False):
    try:
        job_description = request.form.get("job_description", "").strip()
        min_score = float(request.form.get("min_score", 0) or 0)
        boost_keywords = _parse_boost_keywords(request.form.get("boost_keywords", ""))
        files = _get_resume_files()

        if not job_description:
            return jsonify({"error": "Missing job_description"}), 400
        if not files:
            return jsonify({"error": "No resumes provided"}), 400

        all_texts = [job_description]
        parsed_resumes = []

        for uploaded_file in files:
            safe_name = secure_filename(uploaded_file.filename)
            save_path = os.path.join(app.config["UPLOAD_FOLDER"], safe_name)
            uploaded_file.save(save_path)
            ext = os.path.splitext(safe_name)[1].lower()

            if ext == ".csv":
                csv_rows = _extract_csv_candidate_rows(save_path, safe_name)
                for csv_candidate in csv_rows:
                    parsed_resumes.append(csv_candidate)
                    all_texts.append(csv_candidate.get("raw_text", ""))
            else:
                parsed = parse_resume(save_path)
                parsed["filename"] = safe_name
                parsed_resumes.append(parsed)
                all_texts.append(parsed.get("raw_text", ""))

        vectorizer.fit(all_texts)
        jd_vector = vectorizer.transform(job_description)
        jd_tokens = vectorizer.tokenize(job_description)

        candidates = []
        for parsed in parsed_resumes:
            resume_text = parsed.get("raw_text", "")
            resume_vector = vectorizer.transform(resume_text)
            resume_tokens = vectorizer.tokenize(resume_text)

            cosine_score = cosine_similarity(jd_vector, resume_vector)
            matched, missing = match_skills(resume_tokens, jd_tokens)
            ai_score = model.predict(cosine_score, matched, missing, resume_text, job_description)

            candidate = {
                "name": parsed.get("name", "Unknown"),
                "email": parsed.get("email", "Not found"),
                "phone": parsed.get("phone", "Not found"),
                "filename": parsed.get("filename", "unknown"),
                "keyword_score": round(cosine_score * 100, 2),
                "ai_score": ai_score,
                "final_score": ai_score,
                "matched_skills": matched[:15],
                "missing_skills": missing[:15],
            }

            if force_boost or boost_keywords:
                boost_score(candidate, boost_keywords)

            candidate["interview_questions"] = get_interview_questions(
                candidate.get("missing_skills", []),
                candidate.get("name", "Candidate"),
            )
            candidates.append(candidate)

        ranked = rank_candidates(candidates)
        filtered = [c for c in ranked if c.get("ai_score", 0) >= min_score]

        for index, candidate in enumerate(filtered, start=1):
            candidate["rank"] = index

        return jsonify(filtered)
    except Exception as exc:
        return jsonify({"error": f"Analysis failed: {str(exc)}"}), 500


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/screen")
def screen():
    return render_template("screen.html")


@app.route("/report")
def report():
    return render_template("report.html")


@app.route("/analyze", methods=["POST"])
def analyze():
    return _analyze_internal(force_boost=False)


@app.route("/reanalyze", methods=["POST"])
def reanalyze():
    return _analyze_internal(force_boost=True)


@app.route("/export", methods=["POST"])
def export():
    try:
        payload = request.get_json(silent=True) or {}
        shortlisted = payload.get("shortlisted", [])
        lines = ["Rank,Name,Email,Phone,File,AI Score,Keyword Score,Matched Skills"]

        for c in shortlisted:
            row = [
                str(c.get("rank", "")),
                str(c.get("name", "")).replace(",", " "),
                str(c.get("email", "")).replace(",", " "),
                str(c.get("phone", "")).replace(",", " "),
                str(c.get("filename", "")).replace(",", " "),
                str(c.get("ai_score", "")),
                str(c.get("keyword_score", "")),
                "|".join(c.get("matched_skills", [])),
            ]
            lines.append(",".join(row))

        csv_data = "\n".join(lines)
        response = make_response(csv_data)
        response.headers["Content-Type"] = "text/csv"
        response.headers["Content-Disposition"] = "attachment; filename=shortlisted_candidates.csv"
        return response
    except Exception as exc:
        return jsonify({"error": f"Export failed: {str(exc)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)