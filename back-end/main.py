from fastapi import FastAPI
from fastapi import Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import pandas as pd

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
@app.get("/api/images/")
def get_all_images(offset: int = Query(0), limit: int = Query(1000)):
    total = len(df)
    paged_df = df[['IMAGE_ID', 'IMAGE_FILE', 'TITLE', 'AUTHOR', 'TYPE']].iloc[offset:offset+limit]
    paged = paged_df.to_dict(orient="records")
    for item in paged:
        item['IMAGE_URL'] = f"/images/{item['IMAGE_FILE']}"
    return JSONResponse(content={"images": paged, "scrolled": total, "total": total})