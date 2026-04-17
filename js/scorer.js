// ============================================
// scorer.js — Candidate Scoring & Ranking
// Ranks candidates based on resume-JD match
// ============================================

// ===== MAIN SCORER =====
// Takes JD text + array of resume objects, returns ranked candidates
function scoreCandidates(jdText, resumes) {
  // All docs combined for IDF calculation
  const allDocs = [jdText, ...resumes.map(r => r.text)];

  // Extract JD keywords once
  const jdKeywords = extractKeywords(jdText, 25);

  // Score each resume
  const scored = resumes.map(resume => {
    // Get similarity score 0-100
    const similarityScore = getSimilarityScore(jdText, resume.text, allDocs);

    // Get matched and missing skills
    const { matched, missing } = matchSkills(jdKeywords, resume.text);

    // Bonus points for skill matches
    const skillBonus = Math.round((matched.length / Math.max(jdKeywords.length, 1)) * 20);

    // Final score = similarity + skill bonus (capped at 100)
    const finalScore = Math.min(100, similarityScore + skillBonus);

    // Generate explainability text
    const explanation = generateExplanation(finalScore, matched, missing, similarityScore);

    return {
      name: resume.name,
      fileName: resume.fileName,
      text: resume.text,
      score: finalScore,
      similarityScore,
      skillBonus,
      matched,
      missing,
      explanation,
      jdKeywords
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Add rank numbers
  scored.forEach((candidate, index) => {
    candidate.rank = index + 1;
  });

  return scored;
}

// ===== EXPLANATION GENERATOR =====
// Generates human-readable reason for ranking
function generateExplanation(finalScore, matched, missing, similarityScore) {
  let explanation = '';

  // Score tier
  if (finalScore >= 75) {
    explanation += '✅ Strong candidate. ';
  } else if (finalScore >= 50) {
    explanation += '🔶 Moderate match. ';
  } else if (finalScore >= 25) {
    explanation += '⚠️ Weak match. ';
  } else {
    explanation += '❌ Poor match. ';
  }

  // Skill summary
  if (matched.length > 0) {
    explanation += `Matched ${matched.length} key skill${matched.length > 1 ? 's' : ''} `;
    explanation += `(${matched.slice(0, 3).join(', ')}${matched.length > 3 ? '...' : ''}). `;
  }

  if (missing.length > 0) {
    explanation += `Missing ${missing.length} skill${missing.length > 1 ? 's' : ''} `;
    explanation += `(${missing.slice(0, 3).join(', ')}${missing.length > 3 ? '...' : ''}). `;
  }

  // Similarity context
  explanation += `Content similarity: ${similarityScore}%.`;

  return explanation;
}

// ===== SCORE COLOR =====
// Returns a color based on score for UI
function getScoreColor(score) {
  if (score >= 75) return '#00ff88';
  if (score >= 50) return '#00d4ff';
  if (score >= 25) return '#ffaa00';
  return '#ff6b6b';
}

// ===== SCORE LABEL =====
// Returns a label based on score
function getScoreLabel(score) {
  if (score >= 75) return 'Excellent Match';
  if (score >= 50) return 'Good Match';
  if (score >= 25) return 'Partial Match';
  return 'Low Match';
}

// ===== RESUME HEALTH SCORE =====
// Rates the quality of the resume itself
function getResumeHealthScore(resumeText) {
  let health = 0;
  const text = resumeText.toLowerCase();
  const wordCount = resumeText.split(/\s+/).length;

  // Length check
  if (wordCount >= 200) health += 20;
  else if (wordCount >= 100) health += 10;

  // Has contact info
  if (/email|@|phone|mobile|linkedin/.test(text)) health += 15;

  // Has education section
  if (/education|university|college|degree|bachelor|master/.test(text)) health += 15;

  // Has experience section
  if (/experience|worked|job|position|role|company/.test(text)) health += 20;

  // Has skills section
  if (/skills|technologies|tools|proficient|expertise/.test(text)) health += 15;

  // Has achievements/numbers
  if (/\d+%|\d+ years|\d+ projects|increased|improved|reduced/.test(text)) health += 15;

  return Math.min(100, health);
}

// ===== HEALTH LABEL =====
function getHealthLabel(score) {
  if (score >= 80) return '💪 Strong Resume';
  if (score >= 60) return '👍 Good Resume';
  if (score >= 40) return '📝 Average Resume';
  return '⚠️ Needs Improvement';
}
