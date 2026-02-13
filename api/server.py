from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import sys

# Fix path for Vercel import resolution
sys.path.append(os.path.dirname(__file__))

from vision_logic import analyze_image

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Agency Scout API"}

@app.post("/api/analyze")
async def analyze_endpoint(file: UploadFile = File(...)):
    try:
        content = await file.read()
        mime_type = file.content_type or "image/jpeg"
        
        result = analyze_image(content, mime_type=mime_type)
        
        # Enforce strict minimum score of 70 at the API level
        # EXCEPTION: If vision_logic returned 0 (Invalid Face), allow it.
        try:
            current_score = int(result.get('suitability_score', 0))
            if current_score > 0:
                result['suitability_score'] = max(current_score, 70)
        except:
            if result.get('suitability_score') != 0:
                result['suitability_score'] = 70
            
        return result
    except Exception as e:
        print(f"Analyze Error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
