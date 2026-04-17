import os
import requests
from dotenv import load_dotenv

load_dotenv()

QUESTION_BANK = {
    "python": ["How do you manage virtual environments in Python projects?", "What is the difference between a list and a tuple in Python?", "How would you optimize a slow Python script?"],
    "flask": ["How does Flask handle routing and request methods?", "What is the purpose of Flask Blueprints?", "How do you secure a Flask API endpoint?"],
    "sql": ["How do joins differ between INNER, LEFT, and RIGHT JOIN?", "How do you improve SQL query performance?", "When would you use indexes, and what are their trade-offs?"],
    "docker": ["How is a Docker image different from a container?", "How do you reduce Docker image size for production?", "How do you manage environment-specific config in Dockerized apps?"],
    "git": ["What is the difference between merge and rebase?", "How do you resolve merge conflicts safely?", "How do you structure commits for code review clarity?"],
    "machine learning": ["How do you avoid overfitting in ML models?", "What metrics do you choose for classification vs regression?", "How do you validate model performance before deployment?"],
    "nlp": ["How do tokenization and stemming differ in NLP pipelines?", "What are common preprocessing steps for textual data?", "How do you evaluate an NLP model for real-world use?"],
    "tensorflow": ["How do you build and compile a model in TensorFlow?", "What are callbacks and when should they be used?", "How do you debug exploding or vanishing gradients?"],
    "numpy": ["How does NumPy broadcasting work?", "What is the benefit of vectorization in NumPy?", "How do you optimize memory usage with large arrays?"],
    "pandas": ["How do you handle missing values in pandas?", "How do you merge and join dataframes correctly?", "How do you profile and optimize slow pandas operations?"],
    "rest": ["What are REST principles and why do they matter?", "How do you design idempotent endpoints?", "How do you version REST APIs without breaking clients?"],
    "apis": ["How do you handle API rate limits and retries?", "How do you secure external API integrations?", "How do you test API contracts in CI pipelines?"],
    "deep learning": ["How do you choose architecture depth and width?", "What regularization methods improve deep learning models?", "How do you monitor drift after deployment?"],
    "neural networks": ["How do activation functions influence network behavior?", "What is backpropagation in simple terms?", "How do you diagnose underfitting in neural networks?"],
    "deployment": ["How do you design a safe deployment strategy?", "What monitoring signals indicate deployment issues?", "How do you roll back a failed production release?"],
    "javascript": ["How do `let`, `const`, and `var` differ?", "How does the event loop impact async behavior?", "How do you structure modular JavaScript codebases?"],
    "react": ["How do React hooks improve component design?", "When should you use memoization in React?", "How do you manage global state in large React apps?"],
    "node": ["How does Node.js handle concurrency?", "How do you secure a Node.js backend service?", "How do you profile performance bottlenecks in Node?"],
    "aws": ["Which AWS services would you choose for a web API stack?", "How do you secure AWS IAM permissions?", "How do you optimize cloud cost while scaling?"],
    "linux": ["How do you inspect and troubleshoot process/resource issues in Linux?", "How do file permissions and ownership work in Linux?", "How do you automate operational tasks in Linux environments?"],
}


def get_questions_groq(missing_skills, candidate_name):
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        return []

    try:
        skills = [s for s in missing_skills if s]
        prompt = (
            f"Candidate: {candidate_name}\n"
            f"Missing skills: {', '.join(skills[:10])}\n"
            "Generate exactly one concise technical interview question for each missing skill. "
            "Return strict JSON array format: [{\"skill\":\"...\",\"question\":\"...\"}]"
        )
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "mixtral-8x7b-32768",
                "messages": [
                    {"role": "system", "content": "You generate interview questions in valid JSON only."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.4,
            },
            timeout=20,
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        import json
        parsed = json.loads(content)
        if isinstance(parsed, list):
            return [{"skill": str(i.get("skill", "")).lower(), "question": str(i.get("question", "")).strip()} for i in parsed if i.get("question")]
    except Exception:
        return []
    return []


def get_questions_fallback(missing_skills):
    questions = []
    for skill in missing_skills:
        key = str(skill).strip().lower()
        if key in QUESTION_BANK:
            for q in QUESTION_BANK[key][:2]:
                questions.append({"skill": key, "question": q})
    return questions


def get_interview_questions(missing_skills, candidate_name):
    ai_questions = get_questions_groq(missing_skills, candidate_name)
    if ai_questions:
        return ai_questions
    return get_questions_fallback(missing_skills)
