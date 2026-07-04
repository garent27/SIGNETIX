"""Signetix MSL backend — FastAPI application entry point."""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import CORS_ORIGINS, GLOSS_PASS_THRESHOLD, UPLOAD_DIR
from .database import Base, engine
from .ml.inference import get_model
from .routers import categories, contact, glosses, modules, predict, uploads
from .seed import seed_database

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Signetix MSL Backend API",
    description="Real-time Malaysian Sign Language learning platform backend.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve developer-uploaded category images.
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# REST routers.
app.include_router(categories.router)
app.include_router(modules.router)
app.include_router(glosses.router)
app.include_router(uploads.router)
app.include_router(contact.router)
# WebSocket router.
app.include_router(predict.router)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    seed_database()
    # Warm the model load (non-fatal if the ML stack is missing).
    get_model()


@app.get("/", tags=["meta"])
def read_root():
    model = get_model()
    return {
        "status": "online",
        "service": "Signetix MSL Backend",
        "model_loaded": model.available,
        "model_classes": len(model.actions),
        "gloss_pass_threshold": GLOSS_PASS_THRESHOLD,
    }


@app.get("/health", tags=["meta"])
def health():
    return {"ok": True}
