// ============================================
// highlighter.js — Skill Match UI Renderer
// Renders matched/missing skills + score bars
// ============================================

// ===== RENDER CANDIDATE CARD =====
// Builds full HTML card for one candidate
function renderCandidateCard(candidate) {
  const scoreColor = getScoreColor(candidate.score);
  const scoreLabel = getScoreLabel(candidate.score);
  const healthScore = getResumeHealthScore(candidate.text);
  const healthLabel = getHealthLabel(healthScore);

  // Rank medal emoji
  const rankEmoji =
    candidate.rank === 1 ? '🥇' :
    candidate.rank === 2 ? '🥈' :
    candidate.rank === 3 ? '🥉' : `#${candidate.rank}`;

  // Build matched skills tags
  const matchedTags = candidate.matched.length > 0
    ? candidate.matched.map(skill =>
        `<span class="skill-match">✅ ${skill}</span>`
      ).join('')
    : '<span style="color:#666;font-size:0.85rem">None found</span>';

  // Build missing skills tags
  const missingTags = candidate.missing.length > 0
    ? candidate.missing.map(skill =>
        `<span class="skill-missing">❌ ${skill}</span>`
      ).join('')
    : '<span style="color:#00ff88;font-size:0.85rem">No major gaps!</span>';

  // Build full card HTML
  return `
    <div class="candidate-card rank-${Math.min(candidate.rank, 3)}">

      <!-- Rank Badge -->
      <div class="rank-badge">${rankEmoji}</div>

      <!-- Candidate Name -->
      <div class="candidate-name">👤 ${candidate.name}</div>
      <div style="font-size:0.8rem;color:#666;margin-bottom:10px">
        📁 ${candidate.fileName}
      </div>

      <!-- Match Score -->
      <div class="score-label" style="color:${scoreColor}">
        ${scoreLabel} — ${candidate.score}%
      </div>

      <!-- Score Progress Bar -->
      <div class="score-bar-container">
        <div class="score-bar"
          style="width:${candidate.score}%;background:linear-gradient(90deg,${scoreColor},#0077ff)">
        </div>
      </div>

      <!-- Resume Health -->
      <div style="font-size:0.85rem;color:#888;margin-bottom:12px">
        Resume Health: 
        <span style="color:${getScoreColor(healthScore)}">
          ${healthLabel} (${healthScore}%)
        </span>
      </div>

      <!-- Matched Skills -->
      <div class="skills-section">
        <h5>✅ Matched Skills (${candidate.matched.length})</h5>
        <div>${matchedTags}</div>
      </div>

      <!-- Missing Skills -->
      <div class="skills-section" style="margin-top:10px">
        <h5>❌ Missing Skills (${candidate.missing.length})</h5>
        <div>${missingTags}</div>
      </div>

      <!-- Explainability -->
      <div class="explain-box">
        <strong style="color:#00d4ff">🧠 Why this ranking:</strong><br/>
        ${candidate.explanation}
      </div>

      <!-- Score Breakdown -->
      <div class="explain-box" style="margin-top:8px">
        <strong style="color:#00d4ff">📊 Score Breakdown:</strong><br/>
        Content Similarity: <strong>${candidate.similarityScore}%</strong> &nbsp;|&nbsp;
        Skill Bonus: <strong>+${candidate.skillBonus}%</strong> &nbsp;|&nbsp;
        Final Score: <strong style="color:${scoreColor}">${candidate.score}%</strong>
      </div>

    </div>
  `;
}

// ===== RENDER ALL CANDIDATES =====
// Renders full rankings list into the results section
function renderAllCandidates(candidates) {
  const container = document.getElementById('rankings-container');

  if (!candidates || candidates.length === 0) {
    container.innerHTML = `
      <div style="color:#666;text-align:center;padding:20px">
        No candidates to display.
      </div>`;
    return;
  }

  // Summary bar at top
  const summaryHTML = `
    <div style="
      background:#0f0f1a;
      border:1px solid #00d4ff22;
      border-radius:10px;
      padding:14px 18px;
      margin-bottom:20px;
      font-size:0.9rem;
      color:#aaa;
    ">
      📊 <strong style="color:#00d4ff">${candidates.length}</strong> candidate${candidates.length > 1 ? 's' : ''} analyzed &nbsp;|&nbsp;
      🏆 Top match: <strong style="color:#00ff88">${candidates[0].name} (${candidates[0].score}%)</strong> &nbsp;|&nbsp;
      📉 Lowest: <strong style="color:#ff6b6b">${candidates[candidates.length - 1].name} (${candidates[candidates.length - 1].score}%)</strong>
    </div>
  `;

  // Render all cards
  const cardsHTML = candidates.map(c => renderCandidateCard(c)).join('');

  container.innerHTML = summaryHTML + cardsHTML;
}

// ===== RENDER JD KEYWORDS =====
// Shows extracted keywords from job description
function renderJDKeywords(keywords) {
  const box = document.getElementById('jd-keywords');
  box.classList.remove('hidden');

  const tags = keywords.map(kw =>
    `<span class="keyword-tag">${kw}</span>`
  ).join('');

  box.innerHTML = `
    <h4>🔑 Extracted Keywords (${keywords.length})</h4>
    <div>${tags}</div>
  `;
}
