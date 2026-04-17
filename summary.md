# 📄 Project Summary — Smart Resume Screener Lite

## Problem Statement

Recruiters at small startups manually screen dozens of resumes for every job opening — a process that is slow, inconsistent, and often unconsciously biased. Qualified candidates get rejected because their resume uses different keywords than the job description, not because they lack the skills.

---

## Our Solution

**Smart Resume Screener Lite** is a browser-based AI tool that automates resume screening in seconds. Recruiters upload a job description and multiple resumes — the app ranks candidates, highlights skill gaps, detects bias in the JD, and generates tailored interview questions. No backend, no cost, no setup.

---

## How It Works

1. **PDF Parsing** — resumes and JDs are parsed directly in the browser using PDF.js
2. **Keyword Extraction** — TF-IDF identifies the most important skills and terms from both the JD and each resume
3. **Cosine Similarity Scoring** — each resume is compared to the JD mathematically, producing a match score from 0–100%
4. **Candidate Ranking** — all candidates are ranked on a leaderboard by score
5. **Skill Highlighting** — matched skills shown in green ✅, missing skills in red ❌
6. **Bias Detection** — the JD is scanned for 8 categories of biased language with a bias score and fix suggestions
7. **Interview Questions** — role-specific behavioral, technical, and skill-gap questions are generated per candidate

---

## Key Features

| Feature | Description |
|---|---|
| Multi-resume upload | Screen many candidates at once |
| TF-IDF + Cosine Similarity | Solid NLP-based matching |
| Skill gap highlighting | Clear ✅ / ❌ visual feedback |
| Ranking leaderboard | Instant candidate comparison |
| Bias detector | 8 bias categories, 50+ trigger words |
| Interview Q generator | Tailored questions per candidate |
| Explainability | Plain-English ranking reason per candidate |

---

## Impact

- Helps small startups and solo recruiters screen faster and fairer
- Reduces unconscious bias in hiring through JD analysis
- Helps rejected candidates understand what skills to build
- Fully free — no API costs, no backend, runs in any browser

---

## Tech Stack

HTML · CSS · Vanilla JavaScript · PDF.js · TF-IDF (custom) · Cosine Similarity (custom) · GitHub Pages

---

## Live Demo

🔗 ← add your GitHub Pages link here
