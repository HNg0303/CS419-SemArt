from fastapi import FastAPI
from fastapi import Query, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import pandas as pd
import pickle
import faiss
from image_retrieval import search_similar_images, load_embeddings

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