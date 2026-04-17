// ============================================
// nlp.js — TF-IDF + Cosine Similarity Engine
// Core NLP brain of the Resume Screener
// ============================================

// ===== STOP WORDS (common words to ignore) =====
const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","are","was","were","be","been","being","have","has",
  "had","do","does","did","will","would","could","should","may","might",
  "shall","can","need","dare","ought","used","i","we","you","he","she",
  "it","they","me","us","him","her","them","my","our","your","his","its",
  "their","this","that","these","those","what","which","who","whom","how",
  "when","where","why","all","each","every","both","few","more","most",
  "other","some","such","no","not","only","same","so","than","too","very",
  "just","also","as","if","about","above","after","before","between","into",
  "through","during","including","until","while","among","within","without"
]);

// ===== TOKENIZER =====
// Splits text into clean lowercase words, removes stop words
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\+\#]/g, ' ')  // keep c++, c#
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

// ===== TERM FREQUENCY (TF) =====
// How often each word appears in a document
function computeTF(tokens) {
  const tf = {};
  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });
  // Normalize by total tokens
  Object.keys(tf).forEach(key => {
    tf[key] = tf[key] / tokens.length;
  });
  return tf;
}

// ===== INVERSE DOCUMENT FREQUENCY (IDF) =====
// Words that appear in fewer docs are more important
function computeIDF(documents) {
  const idf = {};
  const totalDocs = documents.length;

  documents.forEach(doc => {
    const uniqueTokens = new Set(tokenize(doc));
    uniqueTokens.forEach(token => {
      idf[token] = (idf[token] || 0) + 1;
    });
  });

  Object.keys(idf).forEach(key => {
    idf[key] = Math.log(totalDocs / (1 + idf[key])) + 1;
  });

  return idf;
}

// ===== TF-IDF VECTOR =====
// Combines TF and IDF into a single score vector
function computeTFIDF(text, idf) {
  const tokens = tokenize(text);
  const tf = computeTF(tokens);
  const tfidf = {};

  Object.keys(tf).forEach(token => {
    tfidf[token] = tf[token] * (idf[token] || 1);
  });

  return tfidf;
}

// ===== COSINE SIMILARITY =====
// Measures how similar two documents are (0 = no match, 1 = perfect match)
function cosineSimilarity(vecA, vecB) {
  const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  allKeys.forEach(key => {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dotProduct += a * b;
    magA += a * a;
    magB += b * b;
  });

  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ===== KEYWORD EXTRACTOR =====
// Extracts top N most important keywords from a text
function extractKeywords(text, topN = 20) {
  const tokens = tokenize(text);
  const tf = computeTF(tokens);

  // Sort by frequency
  const sorted = Object.entries(tf)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(entry => entry[0]);

  return sorted;
}

// ===== SKILL MATCHER =====
// Finds which keywords from JD are present or missing in resume
function matchSkills(jdKeywords, resumeText) {
  const resumeTokens = new Set(tokenize(resumeText));

  const matched = [];
  const missing = [];

  jdKeywords.forEach(skill => {
    if (resumeTokens.has(skill)) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  return { matched, missing };
}

// ===== MAIN SIMILARITY SCORER =====
// Returns a 0-100 score of how well resume matches JD
function getSimilarityScore(jdText, resumeText, allDocs) {
  const idf = computeIDF(allDocs);
  const jdVec = computeTFIDF(jdText, idf);
  const resumeVec = computeTFIDF(resumeText, idf);
  const similarity = cosineSimilarity(jdVec, resumeVec);
  return Math.round(similarity * 100);
}
