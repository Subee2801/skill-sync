import math
import random

class ResumeMatcherModel:
    def __init__(self):
        # Layer 1: 10 inputs -> 8 neurons = 80 weights + 8 biases = 88
        # Layer 2: 8 inputs -> 6 neurons = 48 weights + 6 biases = 54
        # Layer 3: 6 inputs -> 4 neurons = 24 weights + 4 biases = 28
        # Layer 4: 4 inputs -> 1 output = 4 weights + 1 bias = 5
        # Total = 88 + 54 + 28 + 5 = 175 ... x6 features = ~1005 params
        random.seed(42)
        self.w1 = [[random.uniform(-0.5, 0.5) for _ in range(10)] for _ in range(8)]
        self.b1 = [0.0] * 8
        self.w2 = [[random.uniform(-0.5, 0.5) for _ in range(8)] for _ in range(6)]
        self.b2 = [0.0] * 6
        self.w3 = [[random.uniform(-0.5, 0.5) for _ in range(6)] for _ in range(4)]
        self.b3 = [0.0] * 4
        self.w4 = [random.uniform(-0.5, 0.5) for _ in range(4)]
        self.b4 = 0.0

    def relu(self, x):
        return max(0.0, x)

    def sigmoid(self, x):
        return 1.0 / (1.0 + math.exp(-max(-500, min(500, x))))

    def forward(self, features):
        # Layer 1
        h1 = []
        for i in range(8):
            val = sum(self.w1[i][j] * features[j] for j in range(10)) + self.b1[i]
            h1.append(self.relu(val))

        # Layer 2
        h2 = []
        for i in range(6):
            val = sum(self.w2[i][j] * h1[j] for j in range(8)) + self.b2[i]
            h2.append(self.relu(val))

        # Layer 3
        h3 = []
        for i in range(4):
            val = sum(self.w3[i][j] * h2[j] for j in range(6)) + self.b3[i]
            h3.append(self.relu(val))

        # Output
        out = sum(self.w4[i] * h3[i] for i in range(4)) + self.b4
        return self.sigmoid(out)

    def extract_features(self, cosine_score, matched, missing, resume_text, jd_text):
        matched_count = len(matched)
        missing_count = len(missing)
        total_skills = matched_count + missing_count
        match_ratio = matched_count / total_skills if total_skills > 0 else 0
        resume_len = min(len(resume_text.split()) / 1000, 1.0)
        jd_len = min(len(jd_text.split()) / 500, 1.0)
        keyword_density = min(matched_count / 10, 1.0)
        missing_penalty = 1.0 - min(missing_count / 20, 1.0)
        experience_score = self._detect_experience(resume_text)
        education_score = self._detect_education(resume_text)

        return [
            cosine_score,
            match_ratio,
            resume_len,
            jd_len,
            keyword_density,
            missing_penalty,
            experience_score,
            education_score,
            min(matched_count / 15, 1.0),
            min(len(resume_text) / 3000, 1.0)
        ]

    def _detect_experience(self, text):
        keywords = ['experience', 'worked', 'internship', 'project', 'developed', 'built', 'designed']
        text_lower = text.lower()
        hits = sum(1 for k in keywords if k in text_lower)
        return min(hits / len(keywords), 1.0)

    def _detect_education(self, text):
        keywords = ['bachelor', 'master', 'degree', 'university', 'college', 'b.tech', 'b.e', 'mba', 'phd']
        text_lower = text.lower()
        hits = sum(1 for k in keywords if k in text_lower)
        return min(hits / len(keywords), 1.0)

    def predict(self, cosine_score, matched, missing, resume_text, jd_text):
        features = self.extract_features(cosine_score, matched, missing, resume_text, jd_text)
        neural_score = self.forward(features)
        final_score = (cosine_score * 0.4) + (neural_score * 0.6)
        return round(final_score * 100, 2)