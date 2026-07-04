"""Real-time MSL inference engine (adapted from TECHNICAL.md).

Heavy dependencies (tensorflow, mediapipe, pillow, numpy) are imported lazily so
the rest of the API — categories, modules, glosses — runs even on a machine
where the ML stack is not installed. ``SignModel.available`` reports whether
inference can actually run.
"""
from __future__ import annotations

import json
import logging
from collections import deque
from typing import Optional

from ..config import LABEL_MAP_PATH, TFLITE_MODEL_PATH

log = logging.getLogger("signetix.ml")


class SignModel:
    """Lazily-loaded TFLite model + MediaPipe Holistic processor."""

    def __init__(self) -> None:
        self.available = False
        self.error: Optional[str] = None
        self.actions: list[str] = []
        self.sequence_length = 30
        self.num_features = 780

        # Always read the label map (cheap, pure stdlib) so metadata is known.
        try:
            with open(LABEL_MAP_PATH, "r", encoding="utf-8") as f:
                cfg = json.load(f)
            self.actions = cfg["actions_ordered"]
            self.sequence_length = cfg["sequence_length"]
            self.num_features = cfg["num_features"]
        except Exception as exc:  # pragma: no cover - config should exist
            self.error = f"Could not read label map: {exc}"
            log.warning(self.error)
            return

        self._interpreter = None
        self._holistic = None
        self._np = None
        self._build_sequence_features = None
        self._normalize_single_frame = None
        self._input_idx = None
        self._output_idx = None
        self._load_heavy()

    def _load_heavy(self) -> None:
        try:
            import numpy as np
            import tensorflow as tf
            import mediapipe as mp

            from assets2.normalize_frame import (
                build_sequence_features,
                normalize_single_frame,
            )

            interpreter = tf.lite.Interpreter(model_path=str(TFLITE_MODEL_PATH))
            interpreter.resize_tensor_input(
                0, [1, self.sequence_length, self.num_features]
            )
            interpreter.allocate_tensors()

            self._np = np
            self._interpreter = interpreter
            self._input_idx = interpreter.get_input_details()[0]["index"]
            self._output_idx = interpreter.get_output_details()[0]["index"]
            self._holistic = mp.solutions.holistic.Holistic(
                min_detection_confidence=0.5, min_tracking_confidence=0.5
            )
            self._build_sequence_features = build_sequence_features
            self._normalize_single_frame = normalize_single_frame
            self.available = True
            log.info("Loaded MSL model V3 with %d classes.", len(self.actions))
        except Exception as exc:  # tensorflow / mediapipe missing or model error
            self.error = f"ML stack unavailable: {exc}"
            log.warning(self.error)
            self.available = False

    # ── frame helpers ──────────────────────────────────────────────────────
    def extract_keypoints(self, image_np):
        np = self._np
        results = self._holistic.process(image_np)
        pose = (
            np.array(
                [[r.x, r.y, r.z, r.visibility] for r in results.pose_landmarks.landmark]
            ).flatten()
            if results.pose_landmarks
            else np.zeros(33 * 4)
        )
        lh = (
            np.array(
                [[r.x, r.y, r.z] for r in results.left_hand_landmarks.landmark]
            ).flatten()
            if results.left_hand_landmarks
            else np.zeros(21 * 3)
        )
        rh = (
            np.array(
                [[r.x, r.y, r.z] for r in results.right_hand_landmarks.landmark]
            ).flatten()
            if results.right_hand_landmarks
            else np.zeros(21 * 3)
        )
        return np.concatenate([pose, lh, rh])

    def normalize_frame(self, raw_landmarks):
        return self._normalize_single_frame(raw_landmarks)

    def infer(self, sequence_buffer) -> dict:
        """Run a forward pass over a (30, 258) normalized sequence buffer."""
        np = self._np
        sequence_780 = self._build_sequence_features(sequence_buffer)
        model_input = np.expand_dims(sequence_780, axis=0).astype(np.float32)

        self._interpreter.set_tensor(self._input_idx, model_input)
        self._interpreter.invoke()
        probs = self._interpreter.get_tensor(self._output_idx)[0]

        order = np.argsort(probs)[::-1]
        top_5 = [
            {"label": self.actions[i], "confidence": float(probs[i])}
            for i in order[:5]
        ]
        # Full score map so the frontend can read the confidence of whichever
        # gloss the learner is currently being asked to sign (Practice.md).
        scores = {self.actions[i]: float(probs[i]) for i in range(len(self.actions))}
        best = int(order[0])
        return {
            "top_prediction": self.actions[best],
            "confidence": float(probs[best]),
            "top_5": top_5,
            "scores": scores,
        }


# Singleton, created on first import.
_model: Optional[SignModel] = None


def get_model() -> SignModel:
    global _model
    if _model is None:
        _model = SignModel()
    return _model


class FrameSession:
    """Per-connection rolling buffer of normalized frames."""

    def __init__(self, model: SignModel) -> None:
        self.model = model
        self.buffer: deque = deque(maxlen=model.sequence_length)

    def push_image(self, image_np) -> dict:
        raw = self.model.extract_keypoints(image_np)
        self.buffer.append(self.model.normalize_frame(raw))
        if len(self.buffer) < self.model.sequence_length:
            progress = int(len(self.buffer) / self.model.sequence_length * 100)
            return {"calibrating": True, "progress": progress}
        seq = self.model._np.array(self.buffer)
        result = self.model.infer(seq)
        result["calibrating"] = False
        return result
