import type { Module } from "../lib/types";
import { glossLabel, glossTokens } from "../lib/gloss";
import DifficultyBadge from "./DifficultyBadge";
import { PlayIcon } from "./icons";

export default function ModuleCard({
  module,
  onTry,
}: {
  module: Module;
  onTry: (m: Module) => void;
}) {
  const tokens = glossTokens(module.gloss_sentence);
  return (
    <div className="card-hover glass flex flex-col rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {tokens.length} {tokens.length === 1 ? "gloss" : "glosses"}
        </span>
        <DifficultyBadge level={module.difficulty} />
      </div>

      {/* Gloss sequence */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tokens.map((t, i) => (
          <span
            key={i}
            className="rounded-lg border border-hairline bg-void/40 px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-ink"
          >
            {glossLabel(t)}
          </span>
        ))}
      </div>

      {/* Intended sentence */}
      <p className="mt-4 flex-1 text-sm text-muted">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted/70">means</span>
        <br />
        <span className="text-[15px] text-ink">“{module.sentence}”</span>
      </p>

      <button
        onClick={() => onTry(module)}
        className="btn-gradient mt-5 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
      >
        <PlayIcon width={16} height={16} /> Try now
      </button>
    </div>
  );
}
