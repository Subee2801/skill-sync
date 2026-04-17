// bias.js — Bias Detector for Job Descriptions
// Detects potentially biased language in JD and suggests neutral alternatives

const BiasDetector = (() => {

  // ── Bias Dictionary ──────────────────────────────────────────────────────
  const BIAS_PATTERNS = [

    // Gender-coded words (masculine)
    {
      words: ["ninja", "rockstar", "guru", "wizard", "superhero", "dominant",
              "aggressive", "competitive", "fearless", "ambitious", "driven",
              "assertive", "independent", "outspoken", "headstrong", "chairman",
              "manpower", "mankind", "manmade", "salesman", "stewardess"],
      type: "gender",
      label: "Gender-Coded (Masculine)",
      suggestion: "Use neutral terms: e.g. 'expert', 'specialist', 'leader', 'chairperson', 'workforce'",
      severity: "medium"
    },

    // Gender-coded words (feminine)
    {
      words: ["supportive", "nurturing", "empathetic", "collaborative",
              "communal", "warm", "gentle", "interpersonal"],
      type: "gender",
      label: "Gender-Coded (Feminine)",
      suggestion: "These words can subtly signal gender preference. Use task-based descriptions instead.",
      severity: "low"
    },

    // Age bias
    {
      words: ["young", "energetic", "fresh graduate", "recent graduate",
              "digital native", "youthful", "junior", "entry-level only",
              "2-3 years max", "no more than 5 years"],
      type: "age",
      label: "Age Bias",
      suggestion: "Avoid age-restrictive terms. Use skill requirements instead of experience caps.",
      severity: "high"
    },

    // Exclusionary culture-fit terms
    {
      words: ["culture fit", "culture-fit", "beer fridges", "ping pong",
              "fraternity", "brotherhood", "guys", "brogrammer", "hustle culture",
              "work hard play hard", "family atmosphere"],
      type: "culture",
      label: "Exclusionary Culture Language",
      suggestion: "Describe actual team values and work style rather than vague 'culture fit'.",
      severity: "medium"
    },

    // Ability / disability bias
    {
      words: ["walk-in", "walk in", "stand for long hours", "physically fit",
              "able-bodied", "no disability", "normal", "healthy"],
      type: "disability",
      label: "Disability Bias",
      suggestion: "Only mention physical requirements if truly essential for the role.",
      severity: "high"
    },

    // Socioeconomic / elitism
    {
      words: ["ivy league", "top-tier university", "premier institution",
              "elite college", "prestigious school", "unpaid", "no salary",
              "stipend only", "volunteer basis"],
      type: "socioeconomic",
      label: "Socioeconomic Bias",
      suggestion: "Focus on skills and competencies, not institution prestige or unpaid expectations.",
      severity: "high"
    },

    // Nationality / origin bias
    {
      words: ["native english speaker", "mother tongue english",
              "local candidates only", "citizens only", "no visa sponsorship mentioned"],
      type: "origin",
      label: "Origin / Nationality Bias",
      suggestion: "Specify language proficiency level (e.g. 'fluent in English') rather than origin.",
      severity: "high"
    },

    // Overqualification bias
    {
      words: ["not overqualified", "exactly 5 years", "no phd", "no doctorate",
              "must not have more than"],
      type: "overqualification",
      label: "Overqualification Bias",
      suggestion: "Avoid capping experience — focus on whether they can perform the role.",
      severity: "medium"
    }
  ];

  // ── Core Detection Function ──────────────────────────────────────────────
  function detect(jdText) {
    if (!jdText || jdText.trim() === "") {
      return { found: false, flags: [], score: 100, summary: "No JD text provided." };
    }

    const lowerText = jdText.toLowerCase();
    const flags = [];

    BIAS_PATTERNS.forEach(pattern => {
      const matched = pattern.words.filter(word => lowerText.includes(word.toLowerCase()));
      if (matched.length > 0) {
        flags.push({
          type: pattern.type,
          label: pattern.label,
          severity: pattern.severity,
          matchedWords: matched,
          suggestion: pattern.suggestion
        });
      }
    });

    // Score: start at 100, deduct per severity
    let score = 100;
    flags.forEach(f => {
      if (f.severity === "high")   score -= 20;
      if (f.severity === "medium") score -= 10;
      if (f.severity === "low")    score -= 5;
    });
    score = Math.max(0, score);

    return {
      found: flags.length > 0,
      flags,
      score,
      summary: generateSummary(flags, score)
    };
  }

  // ── Summary Text Generator ───────────────────────────────────────────────
  function generateSummary(flags, score) {
    if (flags.length === 0) return "✅ No obvious bias detected in this Job Description.";

    const highCount   = flags.filter(f => f.severity === "high").length;
    const mediumCount = flags.filter(f => f.severity === "medium").length;
    const lowCount    = flags.filter(f => f.severity === "low").length;

    let verdict = "";
    if (score >= 80)      verdict = "🟡 Minor bias signals detected.";
    else if (score >= 50) verdict = "🟠 Moderate bias found — consider revising.";
    else                  verdict = "🔴 Significant bias detected — strongly recommend rewriting.";

    return `${verdict} Found ${flags.length} issue(s): ${highCount} high, ${mediumCount} medium, ${lowCount} low severity.`;
  }

  // ── Render Results to DOM ────────────────────────────────────────────────
  function render(result, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!result.found) {
      container.innerHTML = `
        <div class="bias-clean">
          <span class="bias-icon">✅</span>
          <p>${result.summary}</p>
        </div>`;
      return;
    }

    const scoreColor = result.score >= 80 ? "#f59e0b"
                     : result.score >= 50 ? "#f97316"
                     : "#ef4444";

    const flagsHTML = result.flags.map(flag => {
      const severityClass = `bias-severity-${flag.severity}`;
      const wordsHTML = flag.matchedWords.map(w =>
        `<span class="bias-word-tag">${w}</span>`
      ).join(" ");

      return `
        <div class="bias-flag ${severityClass}">
          <div class="bias-flag-header">
            <strong>${flag.label}</strong>
            <span class="bias-badge bias-badge-${flag.severity}">${flag.severity.toUpperCase()}</span>
          </div>
          <div class="bias-matched">Detected: ${wordsHTML}</div>
          <div class="bias-suggestion">💡 ${flag.suggestion}</div>
        </div>`;
    }).join("");

    container.innerHTML = `
      <div class="bias-report">
        <div class="bias-score-row">
          <span class="bias-score-label">JD Bias Score</span>
          <span class="bias-score-value" style="color:${scoreColor}">${result.score}/100</span>
        </div>
        <p class="bias-summary">${result.summary}</p>
        <div class="bias-flags">${flagsHTML}</div>
      </div>`;
  }

  // ── CSS Styles (injected once) ───────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById("bias-styles")) return;
    const style = document.createElement("style");
    style.id = "bias-styles";
    style.textContent = `
      .bias-clean { display:flex; align-items:center; gap:10px; padding:12px 16px;
        background:#f0fdf4; border-radius:8px; color:#15803d; font-weight:500; }
      .bias-icon { font-size:1.4rem; }
      .bias-report { display:flex; flex-direction:column; gap:14px; }
      .bias-score-row { display:flex; justify-content:space-between; align-items:center;
        padding:10px 16px; background:#f8fafc; border-radius:8px; }
      .bias-score-label { font-weight:600; color:#475569; }
      .bias-score-value { font-size:1.5rem; font-weight:800; }
      .bias-summary { margin:0; padding:10px 14px; background:#fff7ed;
        border-left:4px solid #f97316; border-radius:4px; color:#7c2d12; font-size:0.9rem; }
      .bias-flags { display:flex; flex-direction:column; gap:10px; }
      .bias-flag { padding:12px 14px; border-radius:8px; background:#fff;
        border:1px solid #e2e8f0; }
      .bias-severity-high   { border-left:4px solid #ef4444; }
      .bias-severity-medium { border-left:4px solid #f97316; }
      .bias-severity-low    { border-left:4px solid #f59e0b; }
      .bias-flag-header { display:flex; justify-content:space-between;
        align-items:center; margin-bottom:6px; }
      .bias-flag-header strong { color:#1e293b; font-size:0.95rem; }
      .bias-badge { font-size:0.7rem; padding:2px 8px; border-radius:999px;
        font-weight:700; letter-spacing:0.05em; }
      .bias-badge-high   { background:#fee2e2; color:#b91c1c; }
      .bias-badge-medium { background:#ffedd5; color:#c2410c; }
      .bias-badge-low    { background:#fef9c3; color:#a16207; }
      .bias-matched { margin-bottom:6px; font-size:0.85rem; color:#475569; }
      .bias-word-tag { display:inline-block; background:#fef2f2; color:#dc2626;
        border:1px solid #fecaca; border-radius:4px; padding:1px 7px;
        font-size:0.8rem; margin:2px 2px; }
      .bias-suggestion { font-size:0.85rem; color:#15803d; background:#f0fdf4;
        padding:6px 10px; border-radius:6px; }
    `;
    document.head.appendChild(style);
  }

  // ── Public API ───────────────────────────────────────────────────────────
  return {
    detect,
    render,
    injectStyles,

    // Convenience: run detect + render in one call
    analyze(jdText, containerId) {
      injectStyles();
      const result = detect(jdText);
      if (containerId) render(result, containerId);
      return result;
    }
  };

})();
