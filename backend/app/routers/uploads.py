"""Image upload endpoint for developer-supplied category images (Developer.md)."""
import secrets
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from ..config import UPLOAD_DIR
from ..schemas import UploadOut

router = APIRouter(tags=["uploads"])

ALLOWED = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
MAX_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/uploads", response_model=UploadOut)
async def upload_image(request: Request, file: UploadFile = File(...)):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED:
        raise HTTPException(status_code=415, detail=f"Unsupported file type: {suffix or 'unknown'}")

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds the 5 MB limit")

    name = f"{secrets.token_hex(8)}{suffix}"
    (UPLOAD_DIR / name).write_bytes(data)

    # Absolute URL so the frontend can load it regardless of origin.
    base = str(request.base_url).rstrip("/")
    return UploadOut(url=f"{base}/uploads/{name}")
