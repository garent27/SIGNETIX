import { useEffect, useState } from "react";
import {
  createCategory,
  createModule,
  deleteCategory,
  deleteModule,
  getCategories,
  getModules,
  updateCategory,
  updateModule,
  uploadImage,
} from "../lib/api";
import type { Category, Difficulty, Module } from "../lib/types";
import { DIFFICULTY_LABEL } from "../lib/types";
import { glossLabel, glossTokens } from "../lib/gloss";
import Modal from "../components/Modal";
import GlossTagInput from "../components/GlossTagInput";
import DifficultyBadge from "../components/DifficultyBadge";
import { EditIcon, PlusIcon, TrashIcon } from "../components/icons";

const inputClass =
  "w-full rounded-xl border border-hairline bg-void/50 px-4 py-3 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-azure/60";

type Tab = "categories" | "modules";

export default function Developer() {
  const [tab, setTab] = useState<Tab>("categories");
  const [categories, setCategories] = useState<Category[]>([]);

  const reloadCats = () => getCategories(true).then(setCategories).catch(() => setCategories([]));
  useEffect(() => {
    reloadCats();
  }, []);

  return (
    <div className="animate-fade-up">
      <header className="max-w-2xl">
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-ember">
          Developer mode
        </span>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Manage the <span className="text-gradient">library</span>
        </h1>
        <p className="mt-3 text-muted">
          Create and curate the categories and practice modules learners see. Module glosses are
          validated against the model's label map.
        </p>
      </header>

      {/* Tabs */}
      <div className="mt-7 inline-flex rounded-xl border border-hairline bg-void/40 p-1">
        {(["categories", "modules"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-5 py-2 text-sm font-semibold capitalize transition-colors ${
              tab === t ? "bg-brand-gradient text-white" : "text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-7">
        {tab === "categories" ? (
          <CategoriesPanel categories={categories} reload={reloadCats} />
        ) : (
          <ModulesPanel categories={categories} reload={reloadCats} />
        )}
      </div>
    </div>
  );
}

/* ── Categories ─────────────────────────────────────────────────────────── */
function CategoriesPanel({ categories, reload }: { categories: Category[]; reload: () => void }) {
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [confirm, setConfirm] = useState<Category | null>(null);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted">{categories.length} categories</p>
        <button
          onClick={() => setEditing("new")}
          className="btn-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          <PlusIcon width={16} height={16} /> New category
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((c) => (
          <div key={c.id} className="glass flex gap-4 rounded-2xl p-4">
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-hairline">
              {c.image ? (
                <img src={c.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-brand-gradient opacity-30" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-display font-bold">{c.name}</h3>
                <span
                  className={`rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${
                    c.status === 1 ? "border-mint/40 text-mint" : "border-ember/40 text-ember"
                  }`}
                >
                  {c.status === 1 ? "active" : "draft"}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted">{c.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[11px] text-muted">{c.quantity} modules</span>
                <div className="flex gap-1.5">
                  <IconBtn onClick={() => setEditing(c)} label="Edit">
                    <EditIcon width={15} height={15} />
                  </IconBtn>
                  <IconBtn onClick={() => setConfirm(c)} label="Delete" danger>
                    <TrashIcon width={15} height={15} />
                  </IconBtn>
                </div>
              </div>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="glass col-span-full rounded-2xl p-10 text-center text-muted">
            No categories yet. Create your first one.
          </div>
        )}
      </div>

      {editing && (
        <CategoryForm
          category={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
      {confirm && (
        <ConfirmDelete
          title="Delete category?"
          body={`This permanently removes “${confirm.name}” and all ${confirm.quantity} of its modules.`}
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            await deleteCategory(confirm.id);
            setConfirm(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [image, setImage] = useState<string | null>(category?.image ?? null);
  const [active, setActive] = useState((category?.status ?? 1) === 1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(await uploadImage(file));
  };

  const save = async () => {
    setError(null);
    if (!name.trim()) return setError("Please enter a category name.");
    setBusy(true);
    try {
      const payload = { name: name.trim(), description, image, status: active ? 1 : 0 };
      if (category) await updateCategory(category.id, payload);
      else await createCategory(payload);
      onSaved();
    } catch (err: any) {
      setError(err?.message ?? "Could not save category.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={category ? "Edit category" : "New category"}
      subtitle="Describe what learners will practise here."
      onClose={onClose}
      wide
      footer={
        <div className="flex items-center justify-between gap-3">
          {error ? <span className="text-sm text-ember">{error}</span> : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-ghost rounded-xl px-4 py-2.5 text-sm font-semibold">
              Cancel
            </button>
            <button onClick={save} disabled={busy} className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60">
              {busy ? "Saving…" : "Save category"}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <Labeled label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Everyday Greetings" className={inputClass} />
        </Labeled>
        <Labeled label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What it covers and why it's useful…"
            className={`${inputClass} resize-none`}
          />
        </Labeled>
        <Labeled label="Cover image">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-hairline">
              {image ? (
                <img src={image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-void/50 text-[10px] text-muted">
                  No image
                </div>
              )}
            </div>
            <label className="btn-ghost cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold">
              Upload image
              <input type="file" accept="image/*" onChange={onFile} className="hidden" />
            </label>
          </div>
        </Labeled>
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-hairline bg-void/30 px-4 py-3">
          <span className="text-sm">
            <span className="font-semibold text-ink">Active</span>
            <span className="block text-xs text-muted">Visible to learners. Turn off to keep as a draft.</span>
          </span>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-azure" />
        </label>
      </div>
    </Modal>
  );
}

/* ── Modules ────────────────────────────────────────────────────────────── */
function ModulesPanel({ categories, reload }: { categories: Category[]; reload: () => void }) {
  const [catId, setCatId] = useState<number | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [editing, setEditing] = useState<Module | "new" | null>(null);
  const [confirm, setConfirm] = useState<Module | null>(null);

  useEffect(() => {
    if (catId === null && categories.length) setCatId(categories[0].id);
  }, [categories, catId]);

  const loadModules = (id: number) => getModules(id).then(setModules).catch(() => setModules([]));
  useEffect(() => {
    if (catId !== null) loadModules(catId);
  }, [catId]);

  if (categories.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-muted">
        Create a category first, then add modules to it.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-3 text-sm">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Category</span>
          <select
            value={catId ?? ""}
            onChange={(e) => setCatId(Number(e.target.value))}
            className="rounded-xl border border-hairline bg-void/50 px-4 py-2.5 text-sm text-ink outline-none focus:border-azure/60"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => setEditing("new")}
          className="btn-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          <PlusIcon width={16} height={16} /> New module
        </button>
      </div>

      <div className="space-y-3">
        {modules.map((m) => (
          <div key={m.id} className="glass flex items-center gap-4 rounded-2xl p-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {glossTokens(m.gloss_sentence).map((t, i) => (
                  <span key={i} className="rounded-md border border-hairline bg-void/40 px-2 py-0.5 font-mono text-[11px] font-semibold text-ink">
                    {glossLabel(t)}
                  </span>
                ))}
              </div>
              <p className="mt-1.5 truncate text-sm text-muted">“{m.sentence}”</p>
            </div>
            <DifficultyBadge level={m.difficulty} />
            <div className="flex gap-1.5">
              <IconBtn onClick={() => setEditing(m)} label="Edit">
                <EditIcon width={15} height={15} />
              </IconBtn>
              <IconBtn onClick={() => setConfirm(m)} label="Delete" danger>
                <TrashIcon width={15} height={15} />
              </IconBtn>
            </div>
          </div>
        ))}
        {modules.length === 0 && (
          <div className="glass rounded-2xl p-10 text-center text-muted">No modules in this category yet.</div>
        )}
      </div>

      {editing && catId !== null && (
        <ModuleForm
          categoryId={catId}
          module={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            loadModules(catId);
            reload();
          }}
        />
      )}
      {confirm && (
        <ConfirmDelete
          title="Delete module?"
          body={`This removes the module “${confirm.sentence}”.`}
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            await deleteModule(confirm.id);
            setConfirm(null);
            if (catId !== null) loadModules(catId);
            reload();
          }}
        />
      )}
    </div>
  );
}

function ModuleForm({
  categoryId,
  module,
  onClose,
  onSaved,
}: {
  categoryId: number;
  module: Module | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [sentence, setSentence] = useState(module?.sentence ?? "");
  const [glosses, setGlosses] = useState<string[]>(module ? glossTokens(module.gloss_sentence) : []);
  const [difficulty, setDifficulty] = useState<Difficulty>(module?.difficulty ?? "E");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    if (!sentence.trim()) return setError("Enter the sentence this module means.");
    if (glosses.length === 0) return setError("Add at least one gloss to the sequence.");
    setBusy(true);
    try {
      const payload = { sentence: sentence.trim(), gloss_sentence: glosses.join(" "), difficulty };
      if (module) await updateModule(module.id, payload);
      else await createModule(categoryId, payload);
      onSaved();
    } catch (err: any) {
      setError(err?.message ?? "Could not save module.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={module ? "Edit module" : "New module"}
      subtitle="Glosses are picked from the model's label map, in signing order."
      onClose={onClose}
      wide
      footer={
        <div className="flex items-center justify-between gap-3">
          {error ? <span className="text-sm text-ember">{error}</span> : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-ghost rounded-xl px-4 py-2.5 text-sm font-semibold">
              Cancel
            </button>
            <button onClick={save} disabled={busy} className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60">
              {busy ? "Saving…" : "Save module"}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <Labeled label="Means (intended sentence)">
          <input value={sentence} onChange={(e) => setSentence(e.target.value)} placeholder="e.g. How are you? I'm fine." className={inputClass} />
        </Labeled>
        <Labeled label="Gloss sequence">
          <GlossTagInput value={glosses} onChange={setGlosses} />
          <p className="mt-2 font-mono text-[11px] text-muted">
            {glosses.length} gloss{glosses.length === 1 ? "" : "es"} · drag tags to reorder
          </p>
        </Labeled>
        <Labeled label="Difficulty">
          <div className="flex gap-2">
            {(["E", "M", "H"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  difficulty === d ? "border-azure/60 bg-azure/10 text-ink" : "border-hairline text-muted hover:text-ink"
                }`}
              >
                {DIFFICULTY_LABEL[d]}
              </button>
            ))}
          </div>
        </Labeled>
      </div>
    </Modal>
  );
}

/* ── Shared bits ────────────────────────────────────────────────────────── */
function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}

function IconBtn({
  onClick,
  label,
  children,
  danger,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors ${
        danger
          ? "border-hairline text-muted hover:border-ember/50 hover:text-ember"
          : "border-hairline text-muted hover:border-azure/50 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function ConfirmDelete({
  title,
  body,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="btn-ghost rounded-xl px-4 py-2.5 text-sm font-semibold">
            Cancel
          </button>
          <button
            onClick={async () => {
              setBusy(true);
              await onConfirm();
            }}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl border border-ember/50 bg-ember/15 px-5 py-2.5 text-sm font-semibold text-ember transition-colors hover:bg-ember/25 disabled:opacity-60"
          >
            <TrashIcon width={15} height={15} /> {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      }
    >
      <p className="text-sm text-muted">{body}</p>
    </Modal>
  );
}
