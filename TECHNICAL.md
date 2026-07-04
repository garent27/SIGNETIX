# Technicalities
- Context : The method used below has been implemented already in previous project and has worked, so your job is to implement or adapt it for this project.


## Frontend webcam capture portion:

```Typescript
    useEffect(() => {
        // 1. Initialize WebSocket Connection
        // Update URL to match your FastAPI server address
        wsRef.current = new WebSocket('ws://localhost:8000/ws/predict');

        wsRef.current.onopen = () => setIsConnected(true);
        wsRef.current.onclose = () => setIsConnected(false);
        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.prediction) {
                setPrediction(data.prediction);
                setConfidence(data.confidence || 0);
                setTop5(data.top_5 || []);
            }
        };

        // 2. Start User Webcam
        navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((err) => console.error("Error accessing webcam: ", err));

        // 3. Frame Capturing Loop (Send a frame every 200ms (~5 FPS) to avoid choking connection)
        const intervalId = setInterval(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && videoRef.current && canvasRef.current) {
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                if (context) {
                    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                    // Convert frame to base64 jpeg string
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // 0.6 compression quality
                    const base64Data = dataUrl.split(',')[1];
                    
                    wsRef.current.send(JSON.stringify({ image: base64Data }));
                }
            }
        }, 200);
```

* This is just to show the webcam and websocket implementation in the frontend just to let you know how it was implemented before so that you can adapt or follow.

## Backend server

```python
import base64
import json
import io
import os
import numpy as np
from PIL import Image
from collections import deque
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf

# Import the preprocessing code from your notebook directory
from assets2.normalize_frame import normalize_single_frame, build_sequence_features

app = FastAPI(title="Signetix MSL Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 1. LOAD MODEL CONFIGURATION & ARTIFACTS ──
FOLDER_NAME = "assets2"
MODEL_DIR = os.path.join(os.path.dirname(__file__), FOLDER_NAME)
LABEL_MAP_PATH = os.path.join(MODEL_DIR, "label_map.json")
TFLITE_MODEL_PATH = os.path.join(MODEL_DIR, "bim_lstm_v3_f32.tflite")

with open(LABEL_MAP_PATH, "r", encoding="utf-8") as f:
    config_data = json.load(f)

ACTIONS = config_data["actions_ordered"]
SEQUENCE_LENGTH = config_data["sequence_length"]      # 30
NUM_FEATURES = config_data["num_features"]            # 780
NUM_RAW_FEATURES = config_data["num_raw_features"]    # 258

print(f"Loaded MSL Model V3.1.5 with {len(ACTIONS)} target classes.")

# ── 2. INITIALIZE TFLITE INTERPRETER ──
interpreter = tf.lite.Interpreter(model_path=TFLITE_MODEL_PATH)
interpreter.resize_tensor_input(0, [1, SEQUENCE_LENGTH, NUM_FEATURES])
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()[0]
output_details = interpreter.get_output_details()[0]
input_idx = input_details["index"]
output_idx = output_details["index"]

# ── 3. MEDIAPIPE EMBEDDED PROCESSOR ──
import mediapipe as mp
mp_holistic = mp.solutions.holistic
holistic_processor = mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5)

def extract_keypoints_from_image(image_np):
    results = holistic_processor.process(image_np)
    pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*4)
    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    return np.concatenate([pose, lh, rh])

# ── 4. LIVE INFERENCE ENGINE ──
def perform_inference(sequence_buffer: np.ndarray) -> dict:
    sequence_780 = build_sequence_features(sequence_buffer)
    model_input = np.expand_dims(sequence_780, axis=0).astype(np.float32)

    interpreter.set_tensor(input_idx, model_input)
    interpreter.invoke()
    prediction_probabilities = interpreter.get_tensor(output_idx)[0]

    # Get top 5 predictions
    top_5_indices = np.argsort(prediction_probabilities)[-5:][::-1]
    top_5_predictions = [
        {
            "label": ACTIONS[idx],
            "confidence": float(prediction_probabilities[idx])
        }
        for idx in top_5_indices
    ]

    max_idx = np.argmax(prediction_probabilities)
    confidence = prediction_probabilities[max_idx]

    return {
        "top_prediction": ACTIONS[max_idx],
        "confidence": float(confidence),
        "top_5": top_5_predictions
    }

@app.get("/")
def read_root():
    return {"status": "online", "model": "iSuara_V3_1_5"}

# ── 5. WEBSOCKET REAL-TIME STREAM HANDLING ──
@app.websocket("/ws/predict")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    frame_history_buffer = deque(maxlen=SEQUENCE_LENGTH)
    print("Frontend WebSocket connection accepted.")
    
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            base64_image = payload.get("image")

            if base64_image:
                img_bytes = base64.b64decode(base64_image)
                image = Image.open(io.BytesIO(img_bytes))
                image_np = np.array(image)

                raw_landmarks = extract_keypoints_from_image(image_np)
                normalized_landmarks = normalize_single_frame(raw_landmarks)
                frame_history_buffer.append(normalized_landmarks)
                
                if len(frame_history_buffer) == SEQUENCE_LENGTH:
                    current_sequence = np.array(frame_history_buffer)
                    inference_result = perform_inference(current_sequence)
                    await websocket.send_text(json.dumps({
                        "prediction": inference_result["top_prediction"],
                        "confidence": inference_result["confidence"],
                        "top_5": inference_result["top_5"]
                    }))
                else:
                    progress = int((len(frame_history_buffer) / SEQUENCE_LENGTH) * 100)
                    await websocket.send_text(json.dumps({"prediction": f"Calibrating system... {progress}%"}))
                    
    except WebSocketDisconnect:
        print("Frontend disconnected.")
    except Exception as e:
        print(f"Runtime execution error: {e}")
```

## Model information
- It is a sign language classification model that is trained on mediapipe hand and pose landmark coordinates (But you dont need to worry about that)
- It can classify N classes and the output is 'confidence score or accuracy of some sort' for each of the N classes at the very end.
- The model folder will be in the backend/folder (label_map.json and the tflite model)
- So for the design of the practice mode described in content/Practice.md, the websocket facilitates two way communication between frontend and backend. Frontend sends frames of user webcam capture. Backend carries out mediapipe hand and pose landmark extraction as shown above. Then it feeds the output to the model. The model will output the 'confidence score' for each gloss as shown above (Highest score is the likely predicted one). 
- For the circular progress bar as described in content/Practice.md, it should track the current gloss that the user is signing. The score will be tracking the confidence score of that gloss. So either the backend has to know the gloss that the user is currently signing, or the backend pass all the score to frontend and frontend finds the confidence score of the currently tracked gloss.
- As for the top 5 predicted gloss, the functionality is already shown in the code above
* Please implement the backend with this information in mind and also in accordance to all the descriptions in the other md files.


