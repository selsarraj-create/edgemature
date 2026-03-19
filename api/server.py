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
    name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    age: Optional[int] = None
    postcode: Optional[str] = None
    gender: Optional[str] = None
    lead_source: Optional[str] = "DATA LEAD"
    image_url: Optional[str] = None
    lead_id: Optional[str] = None

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Agency Scout API"}

@app.post("/api/crm-webhook")
async def crm_webhook_proxy(payload: CRMLeadPayload):
    """Proxy CRM webhook calls to avoid CORS issues. Optionally updates crm_status in Supabase."""
    crm_status = "fail"
    crm_response_data = {}

    try:
        crm_url = "https://crm.edgetalent.co.uk/api/webhook/lead"
        # Build CRM payload manually (exclude lead_id, exclude None values)
        crm_data = {
            "name": payload.name,
            "email": payload.email,
            "phone": payload.phone,
        }
        if payload.age is not None:
            crm_data["age"] = payload.age
        if payload.postcode:
            crm_data["postcode"] = payload.postcode
        if payload.gender:
            crm_data["gender"] = payload.gender
        if payload.lead_source:
            crm_data["lead_source"] = payload.lead_source
        if payload.image_url:
            crm_data["image_url"] = payload.image_url

        response = http_requests.post(
            crm_url,
            json=crm_data,
            headers={"Content-Type": "application/json"},
            timeout=15,
        )

        if response.ok:
            crm_status = "success"

        try:
            crm_response_data = response.json()
        except:
            crm_response_data = {"detail": response.text}

    except Exception as e:
        print(f"CRM Webhook Proxy Error: {e}")
        crm_response_data = {"error": str(e)}

    # Update Supabase crm_status if lead_id provided
    if payload.lead_id:
        try:
            supabase_url = os.environ.get("VITE_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
            service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

            if supabase_url and service_key:
                update_url = f"{supabase_url}/rest/v1/mature?id=eq.{payload.lead_id}"
                update_resp = http_requests.patch(
                    update_url,
                    json={"crm_status": crm_status},
                    headers={
                        "apikey": service_key,
                        "Authorization": f"Bearer {service_key}",
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal",
                    },
                    timeout=10,
                )
                if not update_resp.ok:
                    print(f"Supabase update failed: {update_resp.status_code} {update_resp.text}")
            else:
                print("Missing Supabase env vars for CRM status update")
        except Exception as e:
            print(f"Supabase update error: {e}")

    return JSONResponse(
        status_code=200,
        content={**crm_response_data, "crm_status": crm_status},
    )

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
