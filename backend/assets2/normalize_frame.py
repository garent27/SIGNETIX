"""
normalize_frame.py (V3) ─ Stages 1-5 only.
Stage 6 (z-score) is BAKED INTO the TFLite model ─ no scaler needed!
"""
import numpy as np

def normalize_single_frame(frame):
    """
    Stage 1 (Anchor) + Stage 2 (Scale) for ONE frame.
    Args:
        frame: np.array shape (258,) ─ raw from extract_keypoints()
    Returns:
        np.array shape (258,) ─ anchor + scale normalized
    """
    frame = frame.copy().astype(np.float64)

    # ── Stage 1: Anchor Subtraction ──
    shoulder_l = frame[44:47]
    shoulder_r = frame[48:51]
    pose_anchor = (shoulder_l + shoulder_r) / 2.0

    # Pose: subtract anchor from xyz of all 33 landmarks
    if np.any(pose_anchor != 0):
        # Valid Python syntax because [:, :3] acts as a subscript slice
        frame[:132].reshape(33, 4)[:, :3] -= pose_anchor

    # Left hand: anchor to wrist
    lh_wrist = frame[132:135].copy()
    if np.any(lh_wrist != 0):
        # Fixed: Tile the 3-element wrist array 21 times to match the 63-element hand array
        frame[132:195] -= np.tile(lh_wrist, 21)

    # Right hand: anchor to wrist
    rh_wrist = frame[195:198].copy()
    if np.any(rh_wrist != 0):
        # Fixed: Tile the 3-element wrist array 21 times to match the 63-element hand array
        frame[195:258] -= np.tile(rh_wrist, 21)

    # ── Stage 2: Scale by Shoulder Width ──
    shoulder_width = np.linalg.norm(shoulder_l - shoulder_r)

    if shoulder_width > 0.01:
        frame[:132].reshape(33, 4)[:, :3] /= shoulder_width
        frame[132:195] /= shoulder_width
        frame[195:258] /= shoulder_width

    return frame

def build_sequence_features(sequence):
    """
    Stages 3 + 4 + 5 for a full 30-frame sequence.

    Args:
        sequence: np.array shape (30, 258) ─ anchor+scale normalized
    Returns:
        np.array shape (30, 780) ─ [position | velocity | acceleration | engineered]
    """
    T = sequence.shape[0]

    # Stage 3: Velocity
    velocity = np.zeros_like(sequence)
    velocity[1:] = sequence[1:] - sequence[:-1]

    # Stage 4: Acceleration
    acceleration = np.zeros_like(velocity)
    acceleration[1:] = velocity[1:] - velocity[:-1]

    # Stage 5: Engineered features
    engineered = np.zeros((T, 6))
    lw = sequence[:, 60:63]   # left wrist xyz
    rw = sequence[:, 64:67]   # right wrist xyz
    nose = sequence[:, 0:3]   # nose xyz
    engineered[:, 0] = np.linalg.norm(lw - rw, axis=1)
    engineered[:, 1:4] = lw - rw
    engineered[:, 4] = np.linalg.norm(lw - nose, axis=1)
    engineered[:, 5] = np.linalg.norm(rw - nose, axis=1)

    return np.concatenate([sequence, velocity, acceleration, engineered], axis=1)