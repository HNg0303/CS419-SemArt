

# Art Retrieval System

## Dataset Setup

1. Download the database [from this Google Drive link.](https://drive.google.com/drive/folders/1p8KH5RD7ZncA-TdNCwWL0qAaB-p7qux-?usp=drive_link)

2. After downloading, place the database files into the `back-end` folder.

3. Navigate to the `back-end` folder and run the following script to generate the merged dataset:

   ```bash
   python process_data.py
   ```

   This will create the file `semart_merged.csv`.

---

## Backend Setup

1. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate      # On macOS/Linux
   venv\Scripts\activate         # On Windows
   ```

2. Install backend dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Navigate to the backend directory:

   ```bash
   cd back-end
   ```

4. Start the backend server:

   ```bash
   uvicorn main:app --reload
   ```

The backend will be available at:

```
http://localhost:8000
```

---

## Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd front-end
   ```

2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

The frontend will be available at:

```
http://localhost:3000
```

---
