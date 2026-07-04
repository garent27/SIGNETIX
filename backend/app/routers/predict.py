"""WebSocket endpoint for real-time sign prediction (TECHNICAL.md).

The client streams base64 JPEG frames; for each completed 30-frame window the
server returns the top prediction, confidence, the top-5 list and a full
``scores`` map. The frontend uses ``scores[currentGloss]`` to drive the circular
accuracy ring for whichever gloss the learner is being asked to sign.
"""
import base64
import io
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..ml.inference import FrameSession, get_model

router = APIRouter()
log = logging.getLogger("signetix.ws")


@router.websocket("/ws/predict")
async def predict_ws(websocket: WebSocket):
    await websocket.accept()
    model = get_model()

    if not model.available:
        await websocket.send_text(
            json.dumps(
                {
                    "error": "model_unavailable",
                    "detail": model.error
                    or "The recognition model is not loaded on this server.",
                }
            )
        )
        await websocket.close()
        return

    # Imported here so a missing ML stack never breaks module import.
    import numpy as np
    from PIL import Image

    session = FrameSession(model)
    log.info("Practice WebSocket connection accepted.")

    try:
        while True:
            raw = await websocket.receive_text()
            payload = json.loads(raw)
            b64 = payload.get("image")
            if not b64:
                continue

            img = Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")
            result = session.push_image(np.array(img))

            if result.get("calibrating"):
                await websocket.send_text(
                    json.dumps(
                        {
                            "prediction": f"Calibrating… {result['progress']}%",
                            "calibrating": True,
                            "progress": result["progress"],
                        }
                    )
                )
            else:
                await websocket.send_text(
                    json.dumps(
                        {
                            "prediction": result["top_prediction"],
                            "confidence": result["confidence"],
                            "top_5": result["top_5"],
                            "scores": result["scores"],
                            "calibrating": False,
                        }
                    )
                )
    except WebSocketDisconnect:
        log.info("Practice WebSocket disconnected.")
    except Exception as exc:  # pragma: no cover
        log.exception("WebSocket runtime error: %s", exc)
        try:
            await websocket.close()
        except Exception:
            pass
