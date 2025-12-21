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


def save_index_to_csv(inverted_index, document_term_count, inverted_path, doccount_path):
    import json
    import pandas as pd
    import os

    inv_rows = []
    for term, postings in inverted_index.items():
        inv_rows.append({"term": term, "postings": json.dumps(postings)})

    inv_df = pd.DataFrame(inv_rows)
    os.makedirs(os.path.dirname(inverted_path) or '.', exist_ok=True)
    inv_df.to_csv(inverted_path, index=False)

    doc_rows = []
    for doc_id, count in document_term_count.items():
        doc_rows.append({"doc_id": doc_id, "term_count": int(count)})

    doc_df = pd.DataFrame(doc_rows)
    doc_df.to_csv(doccount_path, index=False)


def load_inverted_index_from_csv(inverted_path, doccount_path):
    """Load inverted index and document term counts from CSV files created by save_index_to_csv.

    Returns:
        (inverted_index, document_term_count)
    """
    import json
    import pandas as pd

    inv_df = pd.read_csv(inverted_path)
    inverted_index = {}
    for _, row in inv_df.iterrows():
        term = row['term']
        postings = json.loads(row['postings'])
        inverted_index[term] = [tuple(p) for p in postings]

    doc_df = pd.read_csv(doccount_path)
    document_term_count = {row['doc_id']: int(row['term_count']) for _, row in doc_df.iterrows()}

    return inverted_index, document_term_count


if __name__ == "__main__":
    import argparse
    import os

    parser = argparse.ArgumentParser(description="Precompute inverted index and document term counts to CSV files.")
    parser.add_argument("--input_csv", default="Dataset/semart_merged.csv", help="Path to the dataset CSV (relative to back-end/)")
    parser.add_argument("--out_inverted", default="Dataset/inverted_index.csv", help="Output inverted index CSV path")
    parser.add_argument("--out_doccount", default="Dataset/document_term_count.csv", help="Output document term count CSV path")

    args = parser.parse_args()

    if not os.path.exists(args.input_csv):
        print(f"Input CSV not found: {args.input_csv}")
        raise SystemExit(1)

    df = pd.read_csv(args.input_csv)
    if 'COMBINED_TEXT' not in df.columns:
        df['COMBINED_TEXT'] = df['TITLE'].fillna("") + " " + df['TECHNIQUE'].fillna("") + " " + df['DESCRIPTION'].fillna("")

    inverted_index, document_term_count = build_inverted_index(df)

    os.makedirs(os.path.dirname(args.out_inverted) or '.', exist_ok=True)
    save_index_to_csv(inverted_index, document_term_count, args.out_inverted, args.out_doccount)
    print(f"Saved inverted index to {args.out_inverted} and document term counts to {args.out_doccount}")
