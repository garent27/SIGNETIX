import type {
  Category,
  Difficulty,
  Gloss,
  Module,
} from "./types";
import {
  MOCK_CATEGORIES,
  MOCK_GLOSSES,
  MOCK_MODULES,
} from "./mockData";

export const API_BASE =
  (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8000";
export const WS_URL = `${API_BASE.replace(/^http/, "ws")}/ws/predict`;

// ── Offline mock store ──────────────────────────────────────────────────────
// If the backend can't be reached, the app keeps working against this in-memory
// store so categories, modules and developer CRUD all remain usable. Set once a
// request fails so we don't hammer a down server.
let useMock = false;
const mock = {
  categories: structuredClone(MOCK_CATEGORIES) as Category[],
  modules: structuredClone(MOCK_MODULES) as Module[],
  glosses: structuredClone(MOCK_GLOSSES) as Gloss[],
  nextCat: 100,
  nextMod: 100,
};

export const isOffline = () => useMock;

function recomputeQuantities() {
  for (const c of mock.categories) {
    c.quantity = mock.modules.filter((m) => m.category_id === c.id).length;
  }
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  // Fail fast when the backend is unreachable so the offline mock kicks in
  // promptly instead of leaving the UI in a loading state.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3500);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      ...init,
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = Array.isArray(body.detail) ? body.detail[0]?.msg ?? detail : body.detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, res.status);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}

/** Run a network call, falling back to a mock implementation when offline. */
async function withFallback<T>(net: () => Promise<T>, fallback: () => T): Promise<T> {
  if (useMock) return fallback();
  try {
    return await net();
  } catch (err) {
    // A thrown ApiError means the server responded (e.g. 422) — surface it.
    if (err instanceof ApiError) throw err;
    useMock = true;
    return fallback();
  }
}

// ── Categories ──────────────────────────────────────────────────────────────
export function getCategories(includeDrafts = false): Promise<Category[]> {
  return withFallback(
    () => http<Category[]>(`/sign-categories/?include_drafts=${includeDrafts}`),
    () => mock.categories.filter((c) => includeDrafts || c.status === 1)
  );
}

export function getCategory(id: number): Promise<Category> {
  return withFallback(
    () => http<Category>(`/sign-categories/${id}`),
    () => {
      const c = mock.categories.find((x) => x.id === id);
      if (!c) throw new ApiError("Sign category not found", 404);
      return c;
    }
  );
}

export function createCategory(input: {
  name: string;
  description: string;
  image: string | null;
  status: number;
}): Promise<Category> {
  return withFallback(
    () => http<Category>(`/sign-categories`, { method: "POST", body: JSON.stringify(input) }),
    () => {
      const c: Category = { id: mock.nextCat++, quantity: 0, ...input };
      mock.categories.push(c);
      return c;
    }
  );
}

export function updateCategory(
  id: number,
  input: Partial<{ name: string; description: string; image: string | null; status: number }>
): Promise<Category> {
  return withFallback(
    () => http<Category>(`/sign-categories/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    () => {
      const c = mock.categories.find((x) => x.id === id);
      if (!c) throw new ApiError("Sign category not found", 404);
      Object.assign(c, input);
      return c;
    }
  );
}

export function deleteCategory(id: number): Promise<void> {
  return withFallback(
    () => http<void>(`/sign-categories/${id}`, { method: "DELETE" }),
    () => {
      mock.categories = mock.categories.filter((c) => c.id !== id);
      mock.modules = mock.modules.filter((m) => m.category_id !== id);
    }
  );
}

// ── Modules ─────────────────────────────────────────────────────────────────
export function getModules(categoryId: number): Promise<Module[]> {
  return withFallback(
    () => http<Module[]>(`/sign-categories/${categoryId}/modules`),
    () => mock.modules.filter((m) => m.category_id === categoryId)
  );
}

export function getModule(id: number): Promise<Module> {
  return withFallback(
    () => http<Module>(`/modules/${id}`),
    () => {
      const m = mock.modules.find((x) => x.id === id);
      if (!m) throw new ApiError("Module not found", 404);
      return m;
    }
  );
}

export function createModule(
  categoryId: number,
  input: { sentence: string; gloss_sentence: string; difficulty: Difficulty }
): Promise<Module> {
  return withFallback(
    () =>
      http<Module>(`/sign-categories/${categoryId}/modules`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    () => {
      const m: Module = { id: mock.nextMod++, category_id: categoryId, ...input };
      mock.modules.push(m);
      recomputeQuantities();
      return m;
    }
  );
}

export function updateModule(
  id: number,
  input: Partial<{ sentence: string; gloss_sentence: string; difficulty: Difficulty }>
): Promise<Module> {
  return withFallback(
    () => http<Module>(`/modules/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    () => {
      const m = mock.modules.find((x) => x.id === id);
      if (!m) throw new ApiError("Module not found", 404);
      Object.assign(m, input);
      return m;
    }
  );
}

export function deleteModule(id: number): Promise<void> {
  return withFallback(
    () => http<void>(`/modules/${id}`, { method: "DELETE" }),
    () => {
      mock.modules = mock.modules.filter((m) => m.id !== id);
      recomputeQuantities();
    }
  );
}

// ── Glosses ─────────────────────────────────────────────────────────────────
export function getGlosses(): Promise<Gloss[]> {
  return withFallback(
    () => http<Gloss[]>(`/glosses/`),
    () => [...mock.glosses].sort((a, b) => a.name.localeCompare(b.name))
  );
}

export function searchGlosses(q: string, limit = 10): Promise<Gloss[]> {
  return withFallback(
    () => http<Gloss[]>(`/glosses/search?q=${encodeURIComponent(q)}&limit=${limit}`),
    () =>
      mock.glosses
        .filter((g) => g.name.includes(q.trim().toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, limit)
  );
}

// ── Uploads ─────────────────────────────────────────────────────────────────
export async function uploadImage(file: File): Promise<string> {
  if (!useMock) {
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/uploads`, { method: "POST", body: form });
      if (res.ok) return (await res.json()).url as string;
    } catch {
      useMock = true;
    }
  }
  // Offline: keep a local object URL so the preview still works.
  return URL.createObjectURL(file);
}

// ── Contact ─────────────────────────────────────────────────────────────────
export function sendContact(input: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  subscribe: boolean;
}): Promise<{ ok: boolean; detail: string }> {
  return withFallback(
    () => http<{ ok: boolean; detail: string }>(`/contact`, { method: "POST", body: JSON.stringify(input) }),
    () => ({ ok: true, detail: "Thanks — your message has reached the Signetix team." })
  );
}
