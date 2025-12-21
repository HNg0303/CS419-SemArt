from fastapi import FastAPI
from fastapi import Query, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import pandas as pd
import pickle
import faiss
from PIL import Image
from image_retrieval import search_similar_images, load_embeddings
from text_retrieval import BM25Retriever, preprocess_text, build_inverted_index, load_inverted_index_from_csv

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

IMAGE_FOLDER = "Dataset/Images"
CSV_FILE = "Dataset/semart_merged.csv"

# Serve images statically at /images
app.mount("/images", StaticFiles(directory=IMAGE_FOLDER), name="images")

# Load CSV once at startup
df = pd.read_csv(CSV_FILE)
df['COMBINED_TEXT'] = df['TITLE'] + " " + df['TECHNIQUE'] + " " + df['DESCRIPTION']

# Try to load precomputed inverted index and document term counts for faster retrieval
INV_CSV = "Dataset/inverted_index.csv"
DOCCOUNT_CSV = "Dataset/document_term_count.csv"
if os.path.exists(INV_CSV) and os.path.exists(DOCCOUNT_CSV):
    try:
        inverted_index, document_term_count = load_inverted_index_from_csv(INV_CSV, DOCCOUNT_CSV)
        print(f"Loaded precomputed inverted index ({len(inverted_index)} terms) and document_term_count ({len(document_term_count)} docs)")
    except Exception as e:
        print(f"Error loading precomputed index: {e}. Falling back to building index at request time.")
        inverted_index, document_term_count = build_inverted_index(df)
else:
    inverted_index, document_term_count = build_inverted_index(df)

# Load embeddings and build FAISS index
embeddings_filename = "all_images_embedding.pkl"
embeddings, image_paths_clean, problematic_images = load_embeddings(embeddings_filename)
index = faiss.IndexFlatL2(512)
index.add(embeddings)


@app.get("/api/images/")
def get_all_images(offset: int = Query(0), limit: int = Query(100)):
    total = len(df)
    paged_df = df[['IMAGE_ID', 'IMAGE_FILE', 'TITLE', 'AUTHOR', 'TYPE']].iloc[offset:offset+limit]
    paged = paged_df.to_dict(orient="records")
    for item in paged:
        item['IMAGE_URL'] = f"/images/{item['IMAGE_FILE']}"
    return JSONResponse(content={"images": paged, "scrolled": total, "total": total})


@app.post("/api/retrieve/")
async def retrieve_image(file: UploadFile = File(...)):
    # Save uploaded file temporarily
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    # Call your retrieval logic (e.g., using image_retrieval.py)
    # For example:
    similar_files = search_similar_images(temp_path, index, image_paths_clean, k=100)
    
    # Build response with metadata for each image
    results = []
    for fname in similar_files:
        filename = os.path.basename(fname)
        match = df[df['IMAGE_FILE'] == filename]
        if not match.empty:
            row = match.iloc[0]
            results.append({
                "IMAGE_ID": str(row['IMAGE_ID']),
                "IMAGE_FILE": row['IMAGE_FILE'],
                "TITLE": row['TITLE'],
                "AUTHOR": row['AUTHOR'],
                "TYPE": row['TYPE'],
                "IMAGE_URL": f"/images/{row['IMAGE_FILE']}"
            })
        else:
            print(f"Warning: {filename} not found in DataFrame")

    os.remove(temp_path)  # Clean up temp file
    return JSONResponse(content={"images": results})


@app.get("/api/search/")
def search_text(query: str = Query(...)):
    # Use precomputed inverted_index and document_term_count loaded at startup
    # Initialize BM25 retriever and fetch results
    bm25 = BM25Retriever()
    avdl = bm25.average_length_of_docs(df['COMBINED_TEXT'])  # Average document length in the corpus
    results = bm25.process_query(1, query, inverted_index, avdl, document_term_count)

    # Allow client to request number of top results
    # (default to 10, clamp in frontend as needed)
    top_k = 10

    top_items = list(results.items())[:top_k]

    # Build JSON-friendly response with metadata and score
    response_results = []
    for rank, (doc_id, score) in enumerate(top_items, start=1):
        matches = df[df['IMAGE_FILE'] == doc_id]
        if matches.empty:
            continue
        row = matches.iloc[0]
        response_results.append({
            "rank": rank,
            "score": float(score),
            "image_id": str(row.get('IMAGE_ID', '')),
            "image_file": row.get('IMAGE_FILE', ''),
            "title": row.get('TITLE', ''),
            "author": row.get('AUTHOR', ''),
            "type": row.get('TYPE', ''),
            "technique": row.get('TECHNIQUE', ''),
            "description": row.get('DESCRIPTION', ''),
            "image_url": f"/images/{row.get('IMAGE_FILE', '')}"
        })

    response = {
        "query": query,
        "returned": len(response_results),
        "results": response_results
    }

    return JSONResponse(content=response)