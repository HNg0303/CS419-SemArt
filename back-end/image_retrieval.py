import os
import torch
import clip
import numpy as np
import faiss
from PIL import Image
from tqdm import tqdm
import pickle

# Load CLIP (ViT-B/16)
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/16", device=device)
model.eval()
EMBED_DIM = 512



def save_embeddings(data, filename):
    with open(filename, "wb") as f:
        pickle.dump(data, f)


def load_embeddings(filename):
    with open(filename, "rb") as f:
        return pickle.load(f)

def extract_features_batch(image_paths, batch_size=64):
    """
    Extracts CLIP embeddings in batches.
    Returns list of (embedding or None)
    """
    results = []

    for i in tqdm(range(0, len(image_paths), batch_size), desc="Embedding images", ncols=100):
        batch_paths = image_paths[i:i+batch_size]
        imgs = []

        # Load images + preprocess
        for p in batch_paths:
            try:
                img = Image.open(p).convert("RGB")
                imgs.append(preprocess(img))
            except Exception as e:
                print(f"Error loading {p}: {e}")
                imgs.append(None)

        # Filter None images
        valid_indices = [i for i, x in enumerate(imgs) if x is not None]

        if len(valid_indices) == 0:
            # All images were corrupted
            results.extend([None] * len(batch_paths))
            continue

        batch_tensor = torch.stack([imgs[i] for i in valid_indices]).to(device)

        # Extract embeddings
        with torch.no_grad():
            feats = model.encode_image(batch_tensor).cpu().numpy().astype("float16")

        # Assign embeddings back to results list
        feat_idx = 0
        for i in range(len(batch_paths)):
            if i in valid_indices:
                results.append(feats[feat_idx])
                feat_idx += 1
            else:
                results.append(None)

    return results

def search_similar_images(query_image_path, index, image_paths, k=5):
    query_emb = extract_features_batch([query_image_path], batch_size=1)[0].reshape(1, -1)
    distances, idx = index.search(query_emb, k=k)
    return [image_paths[i] for i in idx[0]]

# # Perform search
# query_image_path = "00642-portband.jpg"
# embeddings_filename = "all_images_embedding.pkl"
# embeddings, image_paths_clean, problematic_images = load_embeddings(embeddings_filename)
# index = faiss.IndexFlatL2(EMBED_DIM)
# index.add(embeddings)

# print(f"FAISS index loaded. Total vectors: {index.ntotal}")
# similar_images = search_similar_images(query_image_path, index, image_paths_clean)

# print("\nTop similar images:")
# for img in similar_images:
#     print(img)