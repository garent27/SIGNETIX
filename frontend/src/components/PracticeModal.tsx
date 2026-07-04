import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Module, PredictionMessage, Top5Entry } from "../lib/types";
import { glossLabel, glossTokens } from "../lib/gloss";
import { WS_URL } from "../lib/api";
import CircularProgress from "./CircularProgress";
import { CameraIcon, CheckIcon, CloseIcon, PauseIcon, PlayIcon } from "./icons";

const PASS = 0.8; // matches backend GLOSS_PASS_THRESHOLD
const FRAME_MS = 200; // ~5 fps (TECHNICAL.md)

type Status = "idle" | "running" | "paused" | "done";
type Source = "live" | "demo";

export default function PracticeModal({
  module,
  onClose,
}: {
  module: Module;
  onClose: () => void;
}) {
  const tokens = glossTokens(module.gloss_sentence);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameTimer = useRef<number | null>(null);
  const demoTimer = useRef<number | null>(null);
  const indexRef = useRef(0);

  const [status, setStatus] = useState<Status>("idle");
  const [source, setSource] = useState<Source>("live");
  const [connected, setConnected] = useState(false);
  const [calibrating, setCalibrating] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [confidence, setConfidence] = useState(0); // current gloss, smoothed
  const [completed, setCompleted] = useState<boolean[]>(() => tokens.map(() => false));
  const [top5, setTop5] = useState<Top5Entry[]>([]);
  const [camError, setCamError] = useState<string | null>(null);

  indexRef.current = index;
  const currentRaw = tokens[index];
  const allDone = status === "done";

  // ── advance helper ─────────────────────────────────────────────────────
  const passCurrent = useCallback(() => {
    setCompleted((prev) => {
      const next = [...prev];
      next[indexRef.current] = true;
      return next;
    });
    setConfidence(0);
    setTop5([]);
    if (indexRef.current >= tokens.length - 1) {
      setStatus("done");
      stopCapture();
    } else {
      setIndex((i) => i + 1);
    }
  }, [tokens.length]);

  // ── live websocket frame loop ──────────────────────────────────────────
  const startCapture = useCallback(() => {
    if (frameTimer.current) return;
    frameTimer.current = window.setInterval(() => {
      const ws = wsRef.current;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN || !video || !canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const b64 = canvas.toDataURL("image/jpeg", 0.6).split(",")[1];
      ws.send(JSON.stringify({ image: b64 }));
    }, FRAME_MS);
  }, []);

  const stopCapture = useCallback(() => {
    if (frameTimer.current) {
      clearInterval(frameTimer.current);
      frameTimer.current = null;
    }
    if (demoTimer.current) {
      clearInterval(demoTimer.current);
      demoTimer.current = null;
    }
  }, []);

  // ── demo simulation (model offline) ────────────────────────────────────
  const startDemo = useCallback(() => {
    setSource("demo");
    setConnected(false);
    if (demoTimer.current) return;
    demoTimer.current = window.setInterval(() => {
      setConfidence((c) => {
        const target = 0.97;
        const next = Math.min(target, c + 0.04 + Math.random() * 0.06);
        // fabricate a plausible top-5 around the current gloss
        const others = tokens.filter((_, i) => i !== indexRef.current);
        const t5: Top5Entry[] = [
          { label: tokens[indexRef.current], confidence: next },
          ...others.slice(0, 4).map((g, i) => ({ label: g, confidence: Math.max(0.02, next - 0.25 - i * 0.12) })),
        ];
        setTop5(t5);
        if (next >= PASS) {
          window.setTimeout(() => passCurrent(), 280);
        }
        return next;
      });
    }, 160);
  }, [tokens, passCurrent]);

  // ── connection lifecycle ───────────────────────────────────────────────
  const connect = useCallback(() => {
    let settled = false;
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      const fallbackTimer = window.setTimeout(() => {
        if (!settled && ws.readyState !== WebSocket.OPEN) {
          settled = true;
          try {
            ws.close();
          } catch {
            /* noop */
          }
          startDemo();
        }
      }, 1600);

      ws.onopen = () => {
        settled = true;
        clearTimeout(fallbackTimer);
        setSource("live");
        setConnected(true);
        startCapture();
      };
      ws.onclose = () => setConnected(false);
      ws.onerror = () => {
        if (!settled) {
          settled = true;
          clearTimeout(fallbackTimer);
          startDemo();
        }
      };
      ws.onmessage = (ev) => {
        const data: PredictionMessage = JSON.parse(ev.data);
        if (data.error) {
          startDemo();
          return;
        }
        if (data.calibrating) {
          setCalibrating(data.progress ?? 0);
          return;
        }
        setCalibrating(null);
        if (data.top_5) setTop5(data.top_5);
        // confidence of the gloss we're currently asking for
        const raw = tokens[indexRef.current];
        const score = data.scores?.[raw];
        if (typeof score === "number") {
          setConfidence((prev) => prev * 0.45 + score * 0.55); // light EMA
          if (score >= PASS) passCurrent();
        }
      };
    } catch {
      startDemo();
    }
  }, [tokens, startCapture, startDemo, passCurrent]);

  // ── start / pause ──────────────────────────────────────────────────────
  const start = useCallback(async () => {
    setStatus("running");
    if (!streamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setCamError("Camera unavailable — running in demo mode.");
        startDemo();
      }
    }
    if (!wsRef.current) connect();
    else if (source === "live") startCapture();
    else startDemo();
  }, [connect, startCapture, startDemo, source]);

  const pause = useCallback(() => {
    setStatus("paused");
    stopCapture();
  }, [stopCapture]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stopCapture();
      try {
        wsRef.current?.close();
      } catch {
        /* noop */
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [stopCapture]);

  // Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const passedCount = completed.filter(Boolean).length;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* blurred backdrop over the page underneath */}
      <button
        aria-label="Close practice"
        onClick={onClose}
        className="absolute inset-0 bg-void/80 backdrop-blur-md"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Practising: ${module.sentence}`}
        className="glass relative z-10 flex h-[86vh] w-[min(1140px,94vw)] flex-col overflow-hidden rounded-2xl shadow-glow animate-fade-up"
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-4 border-b border-hairline px-6 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                Practice session
              </span>
              <StatusPill status={status} source={source} connected={connected} />
            </div>
            <h2 className="truncate font-display text-xl font-bold tracking-tight">
              “{module.sentence}”
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
          >
            <CloseIcon width={16} height={16} /> Exit Practice
          </button>
        </header>

        {/* Body */}
        <div className="grid flex-1 grid-cols-1 gap-5 overflow-y-auto p-6 lg:grid-cols-[1.55fr_1fr]">
          {/* Left: webcam + sequence */}
          <div className="flex min-h-0 flex-col">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-hairline bg-void">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full -scale-x-100 object-cover"
              />
              <canvas ref={canvasRef} width={640} height={480} className="hidden" />

              {status === "idle" && (
                <div className="absolute inset-0 grid place-items-center bg-void/70 text-center">
                  <div>
                    <CameraIcon width={34} height={34} className="mx-auto text-azure" />
                    <p className="mt-3 max-w-xs text-sm text-muted">
                      Press <span className="font-semibold text-ink">Start</span> to turn on your
                      camera and begin signing.
                    </p>
                  </div>
                </div>
              )}

              {calibrating !== null && status === "running" && (
                <div className="absolute bottom-3 left-3 rounded-md bg-void/75 px-2.5 py-1 font-mono text-[11px] text-azure backdrop-blur">
                  Calibrating… {calibrating}%
                </div>
              )}
              {camError && (
                <div className="absolute bottom-3 left-3 rounded-md bg-void/75 px-2.5 py-1 font-mono text-[11px] text-ember backdrop-blur">
                  {camError}
                </div>
              )}
              <div className="absolute right-3 top-3 rounded-md bg-void/70 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted backdrop-blur">
                webcam · you
              </div>
            </div>

            {/* Signing sequence — fixed height, horizontal scroll */}
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                  Signing sequence
                </span>
                <span className="font-mono text-[11px] text-muted">
                  {passedCount}/{tokens.length} done
                </span>
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto rounded-xl border border-hairline bg-void/30 p-3">
                {tokens.map((t, i) => {
                  const done = completed[i];
                  const active = i === index && !allDone;
                  return (
                    <div
                      key={i}
                      className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 font-mono text-sm font-semibold tracking-wide transition-all ${
                        done
                          ? "border-mint/45 bg-mint/10 text-mint shadow-[0_0_16px_rgba(61,245,164,0.25)]"
                          : active
                          ? "border-magenta/55 bg-magenta/10 text-ink shadow-[0_0_18px_rgba(229,64,141,0.3)]"
                          : "border-hairline bg-void/40 text-muted"
                      }`}
                    >
                      {done && <CheckIcon width={14} height={14} />}
                      {glossLabel(t)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="mt-4 flex items-center gap-3">
              {status !== "running" ? (
                <button
                  onClick={start}
                  disabled={allDone}
                  className="btn-gradient inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  <PlayIcon width={16} height={16} /> {status === "paused" ? "Resume" : "Start"}
                </button>
              ) : (
                <button
                  onClick={pause}
                  className="btn-ghost inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold"
                >
                  <PauseIcon width={16} height={16} /> Pause
                </button>
              )}
              <span className="font-mono text-xs text-muted">
                {source === "demo" ? "Demo mode · model offline" : "Live model"}
              </span>
            </div>
          </div>

          {/* Right: accuracy + top 5 */}
          <div className="flex min-h-0 flex-col gap-5">
            <div className="glass flex flex-col items-center rounded-2xl p-5">
              <span className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                Signing accuracy
              </span>
              {allDone ? (
                <CircularProgress value={1} passed label="complete" />
              ) : (
                <CircularProgress
                  value={confidence}
                  passed={confidence >= PASS}
                  label={currentRaw ? glossLabel(currentRaw).toLowerCase() : "ready"}
                />
              )}
              <p className="mt-3 text-center text-sm text-muted">
                {allDone ? (
                  <span className="text-mint">All glosses signed — well done! 🎉</span>
                ) : (
                  <>
                    Now signing{" "}
                    <span className="font-mono font-semibold text-ink">
                      {currentRaw ? glossLabel(currentRaw) : "—"}
                    </span>
                    . Reach {Math.round(PASS * 100)}% to lock it in.
                  </>
                )}
              </p>
            </div>

            {/* Top 5 */}
            <div className="glass flex min-h-0 flex-1 flex-col rounded-2xl p-5">
              <span className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                Top 5 predictions
              </span>
              <div className="flex flex-col gap-2 overflow-y-auto">
                {top5.length === 0 && (
                  <p className="text-sm text-muted/70">Predictions appear here once you start signing.</p>
                )}
                {top5.map((p, i) => {
                  const isTarget = p.label === currentRaw;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span
                        className={`w-28 shrink-0 truncate font-mono text-xs font-semibold ${
                          isTarget ? "text-magenta" : "text-ink"
                        }`}
                      >
                        {glossLabel(p.label)}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-void/60">
                        <div
                          className={`h-full rounded-full ${isTarget ? "bg-brand-gradient" : "bg-azure/50"}`}
                          style={{ width: `${Math.round(p.confidence * 100)}%`, transition: "width 0.25s ease" }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-muted">
                        {Math.round(p.confidence * 100)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function StatusPill({
  status,
  source,
  connected,
}: {
  status: Status;
  source: Source;
  connected: boolean;
}) {
  let text = "Ready";
  let color = "text-muted border-hairline";
  if (status === "running") {
    text = source === "demo" ? "Demo running" : connected ? "Live" : "Connecting";
    color = source === "demo" ? "text-ember border-ember/40" : "text-mint border-mint/40";
  } else if (status === "paused") {
    text = "Paused";
    color = "text-azure border-azure/40";
  } else if (status === "done") {
    text = "Complete";
    color = "text-mint border-mint/40";
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {text}
    </span>
  );
}
