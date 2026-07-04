"""Start the Signetix backend: ``python run.py`` (http://localhost:8000)."""
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    reload = os.environ.get("ENVIRONMENT") != "production"
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=reload)
