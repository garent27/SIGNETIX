import type { Difficulty } from "../lib/types";
import { DIFFICULTY_LABEL } from "../lib/types";

const STYLES: Record<Difficulty, string> = {
  E: "text-mint border-mint/35 bg-mint/10",
  M: "text-azure border-azure/35 bg-azure/10",
  H: "text-ember border-ember/40 bg-ember/10",
};

export default function DifficultyBadge({ level }: { level: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${STYLES[level]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {DIFFICULTY_LABEL[level]}
    </span>
  );
}
