# SkillSync - AI Resume Screener

SkillSync is a Flask-based resume screening app that helps recruiters evaluate candidates faster using AI-assisted scoring, skill matching, and interview-question generation.

## Features

- Upload and screen resumes in PDF, TXT, and CSV formats
- AI-based candidate scoring with cosine similarity + model scoring
- Optional keyword boosting for priority skills
- Missing-skill detection and matched-skill highlights
- Auto-generated interview questions with Groq API and local fallback
- Candidate ranking, shortlist/reject workflow, and CSV export
- Interactive dashboard pages with charts and reporting

## Project Structure

```text
skillsync/
├── app.py
├── scorer.py
├── parser.py
├── tfidf.py
├── model.py
├── questions.py
├── requirements.txt
├── .env (local only, not committed)
├── templates/
│   ├── index.html
│   ├── screen.html
│   └── report.html
└── static/
    ├── style.css
    └── script.js
```

## Tech Stack

- Python, Flask, Flask-CORS
- PyPDF2, NumPy
- Requests, python-dotenv
- Vanilla JavaScript, Chart.js, THREE.js

## Getting Started

### 1) Clone the repository

```bash
git clone https://github.com/Subee2801/Smart-resume-screener.git
cd Smart-resume-screener
```

### 2) Create and activate a virtual environment

```bash
python -m venv .venv
```

Windows (PowerShell):

```bash
.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

### 3) Install dependencies

```bash
pip install -r requirements.txt
```

### 4) Configure environment variables

Create/update `.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
```

> `.env` is ignored by git for security.

### 5) Run the app

```bash
python app.py
```

Open in browser:

```text
http://127.0.0.1:5000
```

## CSV Input Format

SkillSync supports CSV bulk candidate ingestion. Expected columns are flexible, with best results when using:

- `Name`
- `Email`
- `Phone`
- `Skills`
- `Experience`

Each CSV row is treated as one candidate profile and scored like a resume.

## API Endpoints

- `GET /` - Home page
- `GET /screen` - Screening page
- `GET /report` - Reporting dashboard
- `POST /analyze` - Analyze and rank uploaded candidates
- `POST /reanalyze` - Re-rank with keyword boost weighting
- `POST /export` - Export shortlisted candidates as CSV

## Notes

- Keep API keys only in `.env`
- Upload files are stored locally in `uploads/`
- For production use, run behind a WSGI server and add proper auth/logging
