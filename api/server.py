from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import os
import sys
import requests as http_requests

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

class CRMLeadPayload(BaseModel):
    name: str
    email: str
    phone: str
    age: Optional[int] = None
    postcode: Optional[str] = None
    gender: Optional[str] = None
    lead_source: Optional[str] = "DATA LEAD"

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Agency Scout API"}

@app.post("/api/crm-webhook")
async def crm_webhook_proxy(payload: CRMLeadPayload):
    """Proxy CRM webhook calls to avoid CORS issues."""
    try:
        crm_url = "https://crm.edgetalent.co.uk/api/webhook/lead"
        response = http_requests.post(
            crm_url,
            json=payload.model_dump(),
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        return JSONResponse(
            status_code=response.status_code,
            content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"detail": response.text},
        )
    except Exception as e:
        print(f"CRM Webhook Proxy Error: {e}")
        return JSONResponse(status_code=502, content={"error": str(e)})

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
