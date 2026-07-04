import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCategory, getModules } from "../lib/api";
import type { Category, Module } from "../lib/types";
import ModuleCard from "../components/ModuleCard";
import PracticeModal from "../components/PracticeModal";
import { ChevronLeft } from "../components/icons";

export default function CategoryModules() {
  const { categoryId } = useParams();
  const id = Number(categoryId);
  const [category, setCategory] = useState<Category | null>(null);
  const [modules, setModules] = useState<Module[] | null>(null);
  const [active, setActive] = useState<Module | null>(null);

  useEffect(() => {
    setCategory(null);
    setModules(null);
    getCategory(id).then(setCategory).catch(() => setCategory(null));
    getModules(id).then(setModules).catch(() => setModules([]));
  }, [id]);

  return (
    <div className="animate-fade-up">
      <Link
        to="/practice"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ChevronLeft width={16} height={16} /> All categories
      </Link>

      <header className="mt-4 max-w-2xl">
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
          {modules ? `${modules.length} ${modules.length === 1 ? "module" : "modules"}` : "Loading…"}
        </span>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          {category?.name ?? "Category"}
        </h1>
        {category?.description && <p className="mt-3 text-muted">{category.description}</p>}
      </header>

      <div className="mt-9 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {modules === null
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass h-52 animate-pulse rounded-2xl" />
            ))
          : modules.map((m) => <ModuleCard key={m.id} module={m} onTry={setActive} />)}
      </div>

      {modules?.length === 0 && (
        <div className="glass mt-6 rounded-2xl p-10 text-center text-muted">
          No modules in this category yet.
        </div>
      )}

      {active && <PracticeModal module={active} onClose={() => setActive(null)} />}
    </div>
  );
}
