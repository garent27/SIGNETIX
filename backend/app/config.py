"""Central configuration for the Signetix backend.

Values can be overridden with environment variables (optionally via a .env file).
SQLite is used by default for a zero-setup MVP; set DATABASE_URL to a
PostgreSQL DSN (e.g. ``postgresql+psycopg2://user:pass@host/signetix``) to use
PostgreSQL as described in TECH-STACK.md.
"""
import os
from pathlib import Path

try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # python-dotenv is optional
    pass

BASE_DIR = Path(__file__).resolve().parent.parent  # the backend/ directory

# ── Database ───────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{(BASE_DIR / 'signetix.db').as_posix()}",
)

# ── Model artifacts (see TECHNICAL.md) ─────────────────────────────────────
ASSETS_DIR = BASE_DIR / "assets2"
LABEL_MAP_PATH = ASSETS_DIR / "label_map.json"
TFLITE_MODEL_PATH = ASSETS_DIR / "bim_lstm_v3_f32.tflite"

# ── Uploads (developer-supplied category images) ───────────────────────────
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# ── Practice / inference tuning ────────────────────────────────────────────
# Confidence (0-1) at which a gloss is considered correctly signed.
GLOSS_PASS_THRESHOLD = float(os.getenv("GLOSS_PASS_THRESHOLD", "0.80"))

# ── CORS ───────────────────────────────────────────────────────────────────
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
