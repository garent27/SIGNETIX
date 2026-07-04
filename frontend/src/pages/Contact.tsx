import { useState } from "react";
import { sendContact } from "../lib/api";
import { SiteFooter } from "./Home";
import { BoltIcon, CheckIcon, MailIcon } from "../components/icons";

const inputClass =
  "w-full rounded-xl border border-hairline bg-void/50 px-4 py-3 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-azure/60 focus:bg-void/70";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [subscribe, setSubscribe] = useState(true);
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await sendContact({ ...form, subscribe });
      setSent(res.detail);
      setForm({ name: "", email: "", phone: "", message: "" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-fade-up space-y-12">
      <header className="max-w-2xl">
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">Contact</span>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Help us grow <span className="text-gradient">Signetix</span>
        </h1>
        <p className="mt-3 text-muted">
          Questions, ideas, or keen to help us collect more MSL sign data? Send us a note — we read
          every message.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Form */}
        <div className="glass rounded-2xl p-7">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full border border-mint/40 bg-mint/10 text-mint">
                <CheckIcon width={26} height={26} />
              </div>
              <h2 className="mt-4 font-display text-xl font-bold">Message sent</h2>
              <p className="mt-2 max-w-sm text-sm text-muted">{sent}</p>
              <button onClick={() => setSent(null)} className="btn-ghost mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold">
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name">
                  <input required value={form.name} onChange={set("name")} placeholder="Your name" className={inputClass} />
                </Field>
                <Field label="Email">
                  <input required type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className={inputClass} />
                </Field>
              </div>
              <Field label="Phone (optional)">
                <input value={form.phone} onChange={set("phone")} placeholder="+60 ..." className={inputClass} />
              </Field>
              <Field label="Message">
                <textarea
                  required
                  value={form.message}
                  onChange={set("message")}
                  rows={5}
                  placeholder="Tell us how you'd like to get involved…"
                  className={`${inputClass} resize-none`}
                />
              </Field>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-hairline bg-void/30 p-3.5">
                <input
                  type="checkbox"
                  checked={subscribe}
                  onChange={(e) => setSubscribe(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-hairline bg-void accent-azure"
                />
                <span className="text-sm">
                  <span className="font-semibold text-ink">Subscribe to the Signetix newsletter</span>
                  <span className="block text-muted">
                    Get the latest on new categories, modules and features.
                  </span>
                </span>
              </label>

              <button
                type="submit"
                disabled={busy}
                className="btn-gradient inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold disabled:opacity-60"
              >
                {busy ? "Sending…" : "Submit message"}
              </button>
            </form>
          )}
        </div>

        {/* Side info */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-mint">
              <BoltIcon width={13} height={13} /> Why it matters
            </span>
            <p className="mt-3 text-sm text-muted">
              Signetix is built by a team of four. The more sign samples we gather, the more glosses
              the model can recognise — and the richer everyone's practice becomes.
            </p>
          </div>
          <div className="glass rounded-2xl p-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Reach us directly</span>
            <a href="mailto:khangwei2015@gmail.com" className="mt-3 flex items-center gap-3 text-ink hover:text-azure">
              <MailIcon width={18} height={18} className="text-azure" /> khangwei2015@gmail.com
            </a>
            <a href="tel:+60139799998" className="mt-2 flex items-center gap-3 text-ink hover:text-azure">
              <span className="grid h-[18px] w-[18px] place-items-center text-azure">☎</span> +60 13-979 9998
            </a>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}
