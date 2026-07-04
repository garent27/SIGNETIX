import { useEffect, useRef, useState } from "react";
import { searchGlosses } from "../lib/api";
import type { Gloss } from "../lib/types";
import { glossLabel } from "../lib/gloss";
import { CloseIcon, SearchIcon } from "./icons";

/**
 * Build a gloss sequence by searching the model's label map. Picked glosses
 * become removable, drag-reorderable tags. Only glosses that exist in the label
 * map can be added, so the resulting sequence is always valid (Developer.md).
 */
export default function GlossTagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Gloss[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const dragIndex = useRef<number | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;
    searchGlosses(query, 8).then((r) => {
      if (alive) {
        setResults(r.filter((g) => !value.includes(g.name)));
        setHighlight(0);
      }
    });
    return () => {
      alive = false;
    };
  }, [query, value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const add = (name: string) => {
    if (!value.includes(name)) onChange([...value, name]);
    setQuery("");
    setOpen(true);
  };
  const remove = (name: string) => onChange(value.filter((v) => v !== name));

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[highlight]) add(results[highlight].name);
    } else if (e.key === "Backspace" && !query && value.length) {
      remove(value[value.length - 1]);
    }
  };

  // drag reorder
  const onDrop = (target: number) => {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === target) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(target, 0, moved);
    onChange(next);
  };

  return (
    <div ref={boxRef} className="relative">
      {/* Tags */}
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 rounded-xl border border-hairline bg-void/30 p-2.5">
          {value.map((g, i) => (
            <span
              key={g}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className="group inline-flex cursor-grab items-center gap-1.5 rounded-lg border border-magenta/40 bg-magenta/10 px-2.5 py-1.5 font-mono text-xs font-semibold text-ink active:cursor-grabbing"
              title="Drag to reorder"
            >
              <span className="font-mono text-[10px] text-muted">{i + 1}</span>
              {glossLabel(g)}
              <button
                type="button"
                onClick={() => remove(g)}
                aria-label={`Remove ${g}`}
                className="text-muted transition-colors hover:text-ember"
              >
                <CloseIcon width={13} height={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <SearchIcon
          width={16}
          height={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search glosses to add (e.g. nasi, apa)…"
          className="w-full rounded-xl border border-hairline bg-void/50 py-3 pl-9 pr-3 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-azure/60"
        />
      </div>

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-hairline bg-[#0d1424] p-1.5 shadow-2xl">
          {results.map((g, i) => (
            <li key={g.id}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => add(g.name)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  i === highlight ? "bg-azure/10 text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <span className="font-mono font-semibold">{glossLabel(g.name)}</span>
                <span className="font-mono text-[11px] text-muted/70">{g.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query && results.length === 0 && (
        <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-hairline bg-[#0d1424] px-3 py-2.5 text-sm text-muted shadow-2xl">
          No gloss matches “{query}” in the model label map.
        </div>
      )}
    </div>
  );
}
