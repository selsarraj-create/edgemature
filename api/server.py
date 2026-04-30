from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import os
import sys
import time
import hashlib
import requests as http_requests

META_PIXEL_ID = "770548083475802"
META_CAPI_TOKEN = os.environ.get("META_CAPI_TOKEN", "")

def sha256_hash(value: str) -> str:
    """Hash a value with SHA256 as Meta requires for user data."""
    if not value:
        return ""
    return hashlib.sha256(value.strip().lower().encode("utf-8")).hexdigest()

def send_meta_capi_event(email: str, phone: str, name: str, postcode: str = "", event_id: str = ""):
    """Send a server-side Lead event to Meta Conversions API."""
    if not META_CAPI_TOKEN:
        print("META_CAPI_TOKEN not set, skipping CAPI")
        return

    try:
        # Split name into first/last
        name_parts = (name or "").strip().split(" ", 1)
        fn = name_parts[0] if name_parts else ""
        ln = name_parts[1] if len(name_parts) > 1 else ""

        # Normalise UK phone to E.164
        clean_phone = (phone or "").replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
        if clean_phone.startswith("0"):
            clean_phone = "+44" + clean_phone[1:]
        elif not clean_phone.startswith("+"):
            clean_phone = "+" + clean_phone

        user_data = {}
        if email:
            user_data["em"] = [sha256_hash(email)]
        if clean_phone:
            user_data["ph"] = [sha256_hash(clean_phone)]
        if fn:
            user_data["fn"] = [sha256_hash(fn)]
        if ln:
            user_data["ln"] = [sha256_hash(ln)]
        if postcode:
            user_data["zp"] = [sha256_hash(postcode)]
        user_data["country"] = [sha256_hash("gb")]

        event = {
            "event_name": "Lead",
            "event_time": int(time.time()),
            "action_source": "website",
            "user_data": user_data,
        }
        if event_id:
            event["event_id"] = event_id

        capi_url = f"https://graph.facebook.com/v21.0/{META_PIXEL_ID}/events"
        resp = http_requests.post(
            capi_url,
            params={"access_token": META_CAPI_TOKEN},
            json={"data": [event]},
            timeout=10,
        )
        if resp.ok:
            print(f"Meta CAPI Lead event sent successfully")
        else:
            print(f"Meta CAPI error: {resp.status_code} {resp.text}")
    except Exception as e:
        print(f"Meta CAPI exception: {e}")

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
    lead_source: Optional[str] = "FB1"
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

    # Send Meta Conversions API event (server-side)
    event_id = sha256_hash(f"{payload.email}-{int(time.time())}")
    send_meta_capi_event(
        email=payload.email or "",
        phone=payload.phone or "",
        name=payload.name or "",
        postcode=payload.postcode or "",
        event_id=event_id,
    )

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
