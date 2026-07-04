# Signetix Backend (FastAPI)

Real-time Malaysian Sign Language (MSL) backend: content API + a WebSocket that
runs the trained TFLite model over MediaPipe Holistic landmarks.

## Quick start

```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows  (source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
python run.py                    # http://localhost:8000  (docs at /docs)
```

The database (SQLite by default) is created and seeded automatically on startup:
all 20 glosses from `assets2/label_map.json` plus a set of starter categories and
modules. To reseed from a clean slate, delete `signetix.db` and restart.

### Without the ML stack
`tensorflow` and `mediapipe` are heavy. The REST API runs fine without them — only
`/ws/predict` needs them. If they aren't installed, `GET /` reports
`"model_loaded": false` and the WebSocket returns a `model_unavailable` message.
Install everything with `pip install -r requirements.txt` to enable live prediction.

### PostgreSQL
Set `DATABASE_URL` (see `.env.example`), e.g.
`postgresql+psycopg2://signetix:signetix@localhost:5432/signetix`, then start the app.

## API surface

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/sign-categories/` | List categories (`?include_drafts=true` for developer view) |
| GET | `/sign-categories/{id}` | One category |
| POST | `/sign-categories` | Create category |
| PUT | `/sign-categories/{id}` | Update category |
| DELETE | `/sign-categories/{id}` | Delete category + its modules (cascade) |
| GET | `/sign-categories/{id}/modules` | Modules in a category |
| POST | `/sign-categories/{id}/modules` | Create module (validates gloss sequence) |
| GET | `/modules/{id}` | One module |
| PUT | `/modules/{id}` | Update module |
| DELETE | `/modules/{id}` | Delete module |
| GET | `/glosses/` | All recognisable glosses |
| GET | `/glosses/search?q=` | Autocomplete glosses (module authoring) |
| POST | `/uploads` | Upload a category image, returns its URL |
| POST | `/contact` | Contact / newsletter submission |
| WS | `/ws/predict` | Stream base64 JPEG frames → `{prediction, confidence, top_5, scores}` |

## Real-time pipeline
Frontend streams ~5 fps base64 JPEG frames → MediaPipe Holistic extracts pose +
hand landmarks → `assets2/normalize_frame.py` stages 1–5 → 30-frame rolling window
→ TFLite model → per-gloss confidence. The response includes a full `scores` map so
the frontend can read the confidence of whichever gloss the learner is currently
signing to drive the circular accuracy ring.
