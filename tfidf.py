import re
import math

class TFIDFVectorizer:
    def __init__(self):
        self.vocab = {}
        self.idf_scores = {}
        self.vocab_size = 0

    def tokenize(self, text):
        text = text.lower()
        text = re.sub(r'[^a-z0-9\s]', '', text)
        tokens = text.split()
        stop_words = {'the','a','an','and','or','but','in','on','at','to','for','of','with','is','are','was','were','be','been','have','has','i','we','you','they','it'}
        return [t for t in tokens if t not in stop_words and len(t) > 2]

    def fit(self, documents):
        self.vocab = {}
        idx = 0
        doc_count = len(documents)
        word_doc_freq = {}

        for doc in documents:
            tokens = set(self.tokenize(doc))
            for token in tokens:
                if token not in self.vocab:
                    self.vocab[token] = idx
                    idx += 1
                word_doc_freq[token] = word_doc_freq.get(token, 0) + 1

        self.vocab_size = len(self.vocab)
        for word, freq in word_doc_freq.items():
            self.idf_scores[word] = math.log((doc_count + 1) / (freq + 1)) + 1

    def transform(self, text):
        tokens = self.tokenize(text)
        tf = {}
        for token in tokens:
            tf[token] = tf.get(token, 0) + 1

        vector = [0.0] * self.vocab_size
        for token, count in tf.items():
            if token in self.vocab:
                idx = self.vocab[token]
                idf = self.idf_scores.get(token, 1.0)
                vector[idx] = (count / len(tokens)) * idf

        return vector