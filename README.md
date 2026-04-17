# 🧠 Smart Resume Screener Lite

> An AI-powered resume screening tool that ranks candidates, detects bias in job descriptions, and generates tailored interview questions — all in the browser, no backend needed.

---

## 🚀 Live Demo

🔗 [View Live on GitHub Pages](#) ← replace with your actual link after deploy

---

## 📌 What It Does

Upload a Job Description and multiple resumes — the app instantly:

- 📄 Parses PDF and text resumes in the browser
- 🔑 Extracts keywords and skills using TF-IDF
- 📊 Scores and ranks candidates by match percentage
- ✅ Highlights matched and ❌ missing skills per candidate
- 💬 Explains why each candidate was ranked where they are
- 🔍 Detects biased language in job descriptions
- 📋 Auto-generates role-specific interview questions

---

## 🛠️ Tech Stack

| Layer | Tool |
|---|---|
| Frontend | HTML, CSS, Vanilla JS |
| PDF Parsing | PDF.js (browser-based) |
| NLP / Scoring | TF-IDF + Cosine Similarity (custom JS) |
| AI Interview Qs | Rule-based skill-to-question engine |
| Bias Detection | Pattern-matched bias dictionary |
| Hosting | GitHub Pages (free) |

**No backend. No API keys. No cost. Runs 100% in the browser.**

---

## 📁 Project Structure

```
smart-resume-screener/
│
├── index.html          → Main app shell + layout
├── style.css           → All styling
│
├── js/
│   ├── parser.js       → PDF + text resume parsing
│   ├── nlp.js          → TF-IDF + cosine similarity
│   ├── scorer.js       → Scoring + candidate ranking
│   ├── highlighter.js  → Matched/missing skill tags
│   ├── bias.js         → Bias detector for JDs
│   ├── interview.js    → Interview question generator
│   └── app.js          → Main controller
│
├── README.md
└── summary.md
```

---

## ⚙️ How to Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/smart-resume-screener.git

# 2. Open in browser (no server needed)
open index.html
```

Or just visit the live GitHub Pages link above.

---

## 🧪 How to Use

1. **Upload a Job Description** — paste text or upload a PDF
2. **Upload Resumes** — select one or more PDF/text files
3. **Click Analyze** — the app processes everything instantly
4. **See Results:**
   - 🏆 Leaderboard with match % scores
   - ✅ / ❌ Skill tags per candidate
   - 💬 Ranking explanation for each candidate
   - 🔍 Bias report on the JD
   - 📋 Interview questions tailored to each candidate

---

## 💡 Unique Features

### 🔍 Bias Detector
Scans the job description for 8 categories of biased language — gender-coded words, age bias, disability bias, socioeconomic elitism, and more — with a bias score out of 100 and rewrite suggestions.

### 📋 Interview Question Generator
Automatically generates behavioral, situational, technical, and skill-gap questions specific to each candidate's matched and missing skills.

### 💬 Explainability
Every ranking comes with a plain-English explanation of why the candidate scored where they did — not just a number.

---

## 🏆 Judging Criteria Coverage

| Criteria | How We Address It |
|---|---|
| Innovation (25%) | Bias detector + Interview Q generator — rare combo |
| Technical (25%) | TF-IDF + cosine similarity + PDF parsing in browser |
| Functionality (25%) | Multi-resume upload, ranking, skill highlights — fully working |
| Impact (15%) | Helps startups hire fairly, helps candidates improve |
| Presentation (10%) | Clean UI, live demo, instant results |

---

## 👤 Team

- **Name:** ← add your name
- **Hackathon:** ← add hackathon name
- **Date:** ← add date

---

## 📄 License

MIT License — free to use and build upon.
