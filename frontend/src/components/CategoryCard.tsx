import { Link } from "react-router-dom";
import type { Category } from "../lib/types";
import { ArrowRight } from "./icons";

export default function CategoryCard({ category }: { category: Category }) {
  const draft = category.status === 0;
  return (
    <Link
      to={`/practice/${category.id}`}
      className="card-hover glass group flex flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {category.image ? (
          <img
            src={category.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-brand-gradient opacity-30" />
        )}
        {/* gradient + color treatment overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate via-slate/40 to-transparent" />
        <div className="absolute inset-0 mix-blend-multiply bg-gradient-to-tr from-azure/25 via-transparent to-magenta/25" />

        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-md bg-void/70 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink backdrop-blur">
            {category.quantity} {category.quantity === 1 ? "module" : "modules"}
          </span>
          {draft && (
            <span className="rounded-md border border-ember/40 bg-void/70 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-ember backdrop-blur">
              draft
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold tracking-tight">{category.name}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{category.description}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-azure">
          Browse now
          <ArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
