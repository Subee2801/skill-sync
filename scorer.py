import math

STOPWORDS = {
    "strong", "plus", "related", "looking", "bachelors", "degree", "field",
    "preferred", "ideal", "experience", "knowledge", "required", "candidate",
    "should", "have", "with", "and", "the", "for", "our", "team", "will",
    "ability", "excellent", "good", "great", "must", "using", "use", "well",
    "also", "other", "any", "all", "can", "etc", "is", "are", "was", "be",
    "this", "that"
}

def cosine_similarity(vec1, vec2):
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    mag1 = math.sqrt(sum(a * a for a in vec1))
    mag2 = math.sqrt(sum(b * b for b in vec2))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot_product / (mag1 * mag2)

def extract_keywords(tokens, top_n=15):
    freq = {}
    for token in tokens:
        cleaned = token.strip().lower()
        if len(cleaned) < 4 or cleaned in STOPWORDS:
            continue
        freq[cleaned] = freq.get(cleaned, 0) + 1
    sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return [word for word, _ in sorted_words[:top_n]]

def match_skills(resume_tokens, jd_tokens):
    resume_set = {t.lower() for t in resume_tokens if len(t.strip()) >= 4 and t.lower() not in STOPWORDS}
    jd_set = {t.lower() for t in jd_tokens if len(t.strip()) >= 4 and t.lower() not in STOPWORDS}
    matched = list(resume_set & jd_set)
    missing = list(jd_set - resume_set)
    return matched, missing

def rank_candidates(candidates):
    return sorted(candidates, key=lambda x: x['final_score'], reverse=True)


def boost_score(candidate, keywords: list):
    """
    Re-score candidate by giving 2x weight to boost keywords and return ai_score.
    """
    if not keywords:
        return candidate.get("ai_score", candidate.get("final_score", 0.0))

    normalized_keywords = {k.strip().lower() for k in keywords if k and k.strip()}
    if not normalized_keywords:
        return candidate.get("ai_score", candidate.get("final_score", 0.0))

    matched_skills = {s.lower() for s in candidate.get("matched_skills", [])}
    base_ai_score = float(candidate.get("ai_score", candidate.get("final_score", 0.0)))

    boost_hits = len(matched_skills & normalized_keywords)
    max_hits = max(len(normalized_keywords), 1)
    boost_factor = 1 + (boost_hits / max_hits)
    updated_score = min(base_ai_score * boost_factor, 100.0)
    candidate["ai_score"] = round(updated_score, 2)
    candidate["final_score"] = candidate["ai_score"]
    return candidate["ai_score"]