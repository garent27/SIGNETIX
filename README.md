# Signetix

A real-time **Malaysian Sign Language (MSL)** learning platform. Learners practise
signing in front of their webcam and get instant, per-gloss accuracy feedback;
developers curate the categories and practice modules that learners see.

- **Frontend** — React + Vite + TypeScript, Tailwind (dark "subtle neon" theme derived
  from the Signetix mark).
- **Backend** — FastAPI + SQLAlchemy, with a WebSocket that runs the trained TFLite
  model over MediaPipe Holistic landmarks.

## Run it

### 1. Backend (`http://localhost:8000`)
```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows (source venv/bin/activate elsewhere)
pip install -r requirements.txt  # full ML stack; or install the light subset for REST only
python run.py
```
The SQLite database is created and seeded on first start (20 glosses from
`assets2/label_map.json` + starter categories/modules). See `backend/README.md` for
the full endpoint list, PostgreSQL setup, and notes on running without TensorFlow.

### 2. Frontend (`http://localhost:3000`)
```bash
cd frontend
npm install
npm run dev                      # development (Vite)
# or, for a production build:
npm run build && npm run serve
```
The UI talks to the backend at `http://localhost:8000`. If the backend is unreachable it
falls back to an in-memory mock so the interface stays fully explorable, and the practice
session drops into a clearly-labelled demo when the recognition model is offline.

## How practice works
Module → opens a WebSocket → the browser streams ~5 fps webcam frames → the backend
extracts pose + hand landmarks, normalises them, and runs the model → it returns the top
prediction, confidence, a top-5 list and a full per-gloss score map. The frontend reads the
current gloss's score to drive the circular accuracy ring; at 80% the gloss locks (turns
mint green) and practice advances to the next one.

## Layout
```
backend/    FastAPI app, ML inference, seed data, assets2/ (model + label map)
frontend/   React app (src/pages, src/components, src/lib), screenshot tooling
content/    Page specifications
*.md        OVERVIEW / TECH-STACK / DATA-MODEL / API / TECHNICAL specs
```

## Design language
Dark "void" base with layered brand glows, the logo's blue → magenta → orange gradient
used with restraint, mint reserved for "correct", and an ambient landmark-constellation
motif that nods to the MediaPipe keypoints the model is built on. Display type is Sora,
body is Plus Jakarta Sans, and JetBrains Mono carries glosses and model data.
