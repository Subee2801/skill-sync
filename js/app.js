// app.js — Main Controller
// Connects parser.js, nlp.js, scorer.js, highlighter.js, bias.js, interview.js

const App = (() => {

  // ── State ────────────────────────────────────────────────────────────────
  let state = {
    jdText:     "",
    jobTitle:   "",
    candidates: []   // { name, text, score, matchedSkills, missingSkills, ranking }
  };

  // ── Init (runs on page load) ─────────────────────────────────────────────
  function init() {
    BiasDetector.injectStyles();
    InterviewGenerator.injectStyles();

    // JD upload
    document.getElementById("jd-upload")
      ?.addEventListener("change", e => handleFileUpload(e, "jd"));

    document.getElementById("jd-text")
      ?.addEventListener("input", e => {
        state.jdText  = e.target.value;
        state.jobTitle = extractJobTitle(state.jdText);
      });

    // Resume upload (multiple)
    document.getElementById("resume-upload")
      ?.addEventListener("change", e => handleMultipleResumes(e));

    // Analyze button
    document.getElementById("analyze-btn")
      ?.addEventListener("click", runAnalysis);

    // Clear button
    document.getElementById("clear-btn")
      ?.addEventListener("click", clearAll);

    console.log("✅ Smart Resume Screener initialized.");
  }

  // ── File Upload Handlers ─────────────────────────────────────────────────
  async function handleFileUpload(event, target) {
    const file = event.target.files[0];
    if (!file) return;

    showStatus(`Parsing ${file.name}...`, "info");

    try {
      const text = await ResumeParser.parse(file);
      if (target === "jd") {
        state.jdText  = text;
        state.jobTitle = extractJobTitle(text);
        const preview = document.getElementById("jd-preview");
        if (preview) preview.textContent = text.slice(0, 500) + "...";
        showStatus("✅ JD loaded successfully.", "success");
      }
    } catch (err) {
      showStatus(`❌ Failed to parse file: ${err.message}`, "error");
    }
  }

  async function handleMultipleResumes(event) {
    const files = [...event.target.files];
    if (!files.length) return;

    state.candidates = [];
    showStatus(`Parsing ${files.length} resume(s)...`, "info");

    const parsePromises = files.map(async (file, idx) => {
      const text = await ResumeParser.parse(file);
      return {
        name:          extractCandidateName(text, file.name),
        text,
        fileName:      file.name,
        score:         0,
        matchedSkills: [],
        missingSkills: [],
        ranking:       idx + 1
      };
    });

    try {
      state.candidates = await Promise.all(parsePromises);
      showStatus(`✅ ${state.candidates.length} resume(s) loaded. Click Analyze.`, "success");
      renderCandidateList();
    } catch (err) {
      showStatus(`❌ Resume parsing error: ${err.message}`, "error");
    }
  }

  // ── Core Analysis Pipeline ───────────────────────────────────────────────
  async function runAnalysis() {
    if (!state.jdText) {
      showStatus("⚠️ Please upload or paste a Job Description first.", "warning");
      return;
    }
    if (!state.candidates.length) {
      showStatus("⚠️ Please upload at least one resume.", "warning");
      return;
    }

    showStatus("🔍 Analysing candidates...", "info");
    showLoader(true);

    try {
      // 1. Extract JD keywords
      const jdKeywords = NLPEngine.extractKeywords(state.jdText);

      // 2. Score each candidate
      state.candidates = state.candidates.map(candidate => {
        const resumeKeywords = NLPEngine.extractKeywords(candidate.text);
        const score          = Scorer.computeScore(jdKeywords, resumeKeywords);
        const { matched, missing } = Highlighter.compareSkills(jdKeywords, resumeKeywords);

        return { ...candidate, score, matchedSkills: matched, missingSkills: missing };
      });

      // 3. Rank candidates
      state.candidates = Scorer.rank(state.candidates);

      // 4. Render results
      renderLeaderboard();
      renderBiasReport();
      renderDetailCards();

      showStatus("✅ Analysis complete!", "success");
      document.getElementById("results-section")
        ?.scrollIntoView({ behavior: "smooth" });

    } catch (err) {
      showStatus(`❌ Analysis failed: ${err.message}`, "error");
      console.error(err);
    } finally {
      showLoader(false);
    }
  }

  // ── Render: Candidate List (before analysis) ─────────────────────────────
  function renderCandidateList() {
    const container = document.getElementById("candidate-list");
    if (!container) return;

    container.innerHTML = state.candidates.map((c, i) => `
      <div class="candidate-pill">
        <span class="candidate-index">${i + 1}</span>
        <span class="candidate-pill-name">${c.name}</span>
        <span class="candidate-pill-file">${c.fileName}</span>
      </div>`).join("");
  }

  // ── Render: Leaderboard ──────────────────────────────────────────────────
  function renderLeaderboard() {
    const container = document.getElementById("leaderboard");
    if (!container) return;

    const medals = ["🥇", "🥈", "🥉"];

    container.innerHTML = `
      <h2 class="section-title">🏆 Candidate Ranking</h2>
      <div class="leaderboard-list">
        ${state.candidates.map((c, i) => {
          const bar   = Math.round(c.score * 100);
          const medal = medals[i] || `#${i + 1}`;
          const color = bar >= 70 ? "#22c55e" : bar >= 40 ? "#f59e0b" : "#ef4444";
          return `
            <div class="lb-row" onclick="App.scrollToCard('${c.name}')">
              <span class="lb-medal">${medal}</span>
              <span class="lb-name">${c.name}</span>
              <div class="lb-bar-wrap">
                <div class="lb-bar" style="width:${bar}%;background:${color}"></div>
              </div>
              <span class="lb-score" style="color:${color}">${bar}%</span>
            </div>`;
        }).join("")}
      </div>`;
  }

  // ── Render: Bias Report ──────────────────────────────────────────────────
  function renderBiasReport() {
    const container = document.getElementById("bias-section");
    if (!container) return;
    container.innerHTML = `<h2 class="section-title">🔍 JD Bias Report</h2>
      <div id="bias-container"></div>`;
    BiasDetector.analyze(state.jdText, "bias-container");
  }

  // ── Render: Detail Cards ─────────────────────────────────────────────────
  function renderDetailCards() {
    const container = document.getElementById("detail-cards");
    if (!container) return;

    container.innerHTML = `<h2 class="section-title">📄 Candidate Details</h2>`;

    state.candidates.forEach((c, i) => {
      const card = document.createElement("div");
      card.className = "detail-card";
      card.id = `card-${sanitizeId(c.name)}`;

      const matchedHTML  = c.matchedSkills.map(s =>
        `<span class="skill-tag skill-match">✅ ${s}</span>`).join("") || "<em>None</em>";
      const missingHTML  = c.missingSkills.map(s =>
        `<span class="skill-tag skill-miss">❌ ${s}</span>`).join("") || "<em>None</em>";
      const score        = Math.round(c.score * 100);
      const scoreColor   = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

      card.innerHTML = `
        <div class="card-header">
          <span class="card-rank">#${i + 1}</span>
          <span class="card-name">${c.name}</span>
          <span class="card-score" style="color:${scoreColor}">${score}% Match</span>
        </div>
        <div class="card-body">
          <div class="skills-block">
            <p class="skills-label">Matched Skills</p>
            <div class="skills-row">${matchedHTML}</div>
          </div>
          <div class="skills-block">
            <p class="skills-label">Missing Skills</p>
            <div class="skills-row">${missingHTML}</div>
          </div>
          <div class="why-block">
            <p class="skills-label">💬 Why this ranking?</p>
            <p class="why-text">${generateExplanation(c, i)}</p>
          </div>
          <div class="iq-wrap">
            <p class="skills-label">📋 Suggested Interview Questions</p>
            <div id="iq-${sanitizeId(c.name)}"></div>
          </div>
        </div>`;

      container.appendChild(card);

      // Render interview questions inside card
      InterviewGenerator.analyze(
        c.matchedSkills,
        state.jobTitle,
        c.missingSkills,
        `iq-${sanitizeId(c.name)}`,
        c.name
      );
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  function extractJobTitle(text) {
    const lines  = text.split("\n").slice(0, 5);
    const common = ["engineer", "developer", "analyst", "manager", "designer",
                    "scientist", "lead", "architect", "consultant", "intern"];
    for (const line of lines) {
      if (common.some(w => line.toLowerCase().includes(w))) return line.trim();
    }
    return "This Role";
  }

  function extractCandidateName(text, fileName) {
    // Try first non-empty line
    const firstLine = text.split("\n").find(l => l.trim().length > 1)?.trim();
    if (firstLine && firstLine.length < 50 && /^[a-zA-Z\s.'-]+$/.test(firstLine)) {
      return firstLine;
    }
    // Fallback: filename without extension
    return fileName.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
  }

  function generateExplanation(candidate, rank) {
    const score = Math.round(candidate.score * 100);
    const mCount = candidate.matchedSkills.length;
    const xCount = candidate.missingSkills.length;

    if (rank === 0) return `Top candidate with ${score}% match. Strong alignment across ${mCount} key skills.`;
    if (score >= 70) return `Strong match (${score}%). Covers ${mCount} required skills. Only missing ${xCount}.`;
    if (score >= 40) return `Moderate match (${score}%). Has ${mCount} relevant skills but gaps in ${xCount} areas.`;
    return `Lower match (${score}%). Missing ${xCount} key skills — may need significant upskilling.`;
  }

  function sanitizeId(name) {
    return name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
  }

  function showStatus(msg, type = "info") {
    const el = document.getElementById("status-bar");
    if (!el) return;
    const colors = { info: "#3b82f6", success: "#22c55e", warning: "#f59e0b", error: "#ef4444" };
    el.style.background = colors[type] || colors.info;
    el.textContent = msg;
    el.style.display = "block";
    if (type === "success") setTimeout(() => el.style.display = "none", 4000);
  }

  function showLoader(show) {
    const el = document.getElementById("loader");
    if (el) el.style.display = show ? "flex" : "none";
  }

  function clearAll() {
    state = { jdText: "", jobTitle: "", candidates: [] };
    ["jd-preview", "candidate-list", "leaderboard",
     "bias-section", "detail-cards"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = "";
    });
    ["jd-upload", "resume-upload"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    const jdText = document.getElementById("jd-text");
    if (jdText) jdText.value = "";
    showStatus("🗑️ Cleared. Ready for a new session.", "info");
  }

  // ── Public ───────────────────────────────────────────────────────────────
  return {
    init,
    scrollToCard(name) {
      document.getElementById(`card-${sanitizeId(name)}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

})();

// ── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", App.init);
