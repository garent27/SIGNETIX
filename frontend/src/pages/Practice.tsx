import { useEffect, useState } from "react";
import { getCategories } from "../lib/api";
import type { Category } from "../lib/types";
import CategoryCard from "../components/CategoryCard";
import { useApp } from "../state/AppContext";

export default function Practice() {
  const { isDeveloper } = useApp();
  const [categories, setCategories] = useState<Category[] | null>(null);

  useEffect(() => {
    getCategories(isDeveloper).then(setCategories).catch(() => setCategories([]));
  }, [isDeveloper]);

  return (
    <div className="animate-fade-up">
      <header className="max-w-2xl">
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
          Practice library
        </span>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Choose a <span className="text-gradient">category</span>
        </h1>
        <p className="mt-3 text-muted">
          Each category holds a set of practice modules — real sentences you'll sign in front of
          your camera. Pick one to see its modules.
        </p>
      </header>

      <div className="mt-9 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {categories === null
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : categories.map((c) => <CategoryCard key={c.id} category={c} />)}
      </div>

      {categories?.length === 0 && (
        <div className="glass mt-6 rounded-2xl p-10 text-center text-muted">
          No categories yet. {isDeveloper ? "Create one in Developer mode." : "Check back soon."}
        </div>
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="aspect-[16/10] animate-pulse bg-float/60" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-1/2 animate-pulse rounded bg-float/60" />
        <div className="h-3 w-full animate-pulse rounded bg-float/40" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-float/40" />
      </div>
    </div>
  );
}
