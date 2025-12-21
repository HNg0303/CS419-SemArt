import os
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import matplotlib.pyplot as plt
from PIL import Image
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer


nltk.download('stopwords')
nltk.download('wordnet')


def preprocess_text(text):
    # Lowercase
    text = text.lower()
    # Remove punctuation and non-alphabetic characters
    text = re.sub(r'[^a-z\s]', '', text)
    # Tokenization
    tokens = text.split()
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    tokens = [word for word in tokens if word not in stop_words]
    # Lemmatization
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(word) for word in tokens]
    return ' '.join(tokens)

import math
import pandas as pd
import nltk
from collections import OrderedDict
import re

# Define a basic BM25 implementation
class BM25Retriever:
    def __init__(self, k1=1.2, b=0.75, k2=100):
        self.k1 = k1
        self.b = b
        self.k2 = k2

    def average_length_of_docs(self, docs):
        total_length = sum(len(doc.split()) for doc in docs)
        return total_length / len(docs)

    def get_BM25_score(self, N, ni, K, fi, qfi):
        return math.log((N - ni + 0.5) / (ni + 0.5)) * ((self.k1 + 1) * fi) / (K + fi) * ((self.k2 + 1) * qfi) / (self.k2 + qfi)

    def get_top_relevant_documents(self, inverted_index, document_term_count, query, avdl):
        score_list = dict()
        N = len(document_term_count)
        query_terms = nltk.FreqDist(query.split())

        for term, freq in query_terms.items():
            if term not in inverted_index:
                continue
            inv_list = inverted_index[term]
            for posting in inv_list:
                doc_id = posting[0]
                doc_length = document_term_count[doc_id]
                K = self.k1 * ((1 - self.b) + self.b * (doc_length / avdl))
                score = self.get_BM25_score(N, len(inv_list), K, posting[1], freq)
                score_list[doc_id] = score_list.get(doc_id, 0) + score
        
        return OrderedDict(sorted(score_list.items(), key=lambda item: item[1], reverse=True)[:20])

    def process_query(self, query_id, query, inverted_index, avdl, document_term_count):
        results = self.get_top_relevant_documents(inverted_index, document_term_count, query, avdl)
        return results
    
    # Build inverted index and document term count from DataFrame
def build_inverted_index(df):
    inverted_index = {}
    document_term_count = {}

    for index, row in df.iterrows():
        doc_id = row['IMAGE_FILE']
        text = row['COMBINED_TEXT']
        processed_text = preprocess_text(text)
        tokens = processed_text.split()
        document_term_count[doc_id] = len(tokens)

        for term in set(tokens):
            if term not in inverted_index:
                inverted_index[term] = []
            inverted_index[term].append((doc_id, tokens.count(term)))

    return inverted_index, document_term_count
