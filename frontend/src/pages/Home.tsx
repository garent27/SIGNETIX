import { Link } from "react-router-dom";
import CircularProgress from "../components/CircularProgress";
import { LogoMark } from "../components/Logo";
import { ArrowRight, BoltIcon, CameraIcon, SparkIcon, MailIcon } from "../components/icons";

export default function Home() {
  return (
    <div className="space-y-24">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] animate-fade-up">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-slate/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <BoltIcon width={13} height={13} className="text-mint" />
            Malaysian Sign Language · live practice
          </span>

          <h1 className="mt-6 font-display text-[2.9rem] font-extrabold leading-[1.05] tracking-[-0.03em] md:text-[3.5rem]">
            Sign it. See it.
            <br />
            <span className="text-gradient">Get it right.</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg text-muted">
            Signetix watches you sign through your camera and scores every gloss as you go — so
            you learn Malaysian Sign Language by <em className="not-italic text-ink">doing</em>, not
            just watching.
          </p>

          <p className="mt-4 font-mono text-sm tracking-tight text-muted">
            <span className="text-azure">Cheap</span> · <span className="text-magenta">Effective</span>{" "}
            · <span className="text-ember">User-friendly</span> · Sign language practice made easy
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/practice"
              className="btn-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold"
            >
              Practise MSL now <ArrowRight width={18} height={18} />
            </Link>
            <Link
              to="/contact"
              className="btn-ghost inline-flex items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold"
            >
              Help us collect data
            </Link>
          </div>

          <dl className="mt-10 flex gap-8">
            <Stat value="20+" label="MSL glosses" />
            <Stat value="5" label="Categories" />
            <Stat value="~5 fps" label="Live scoring" />
          </dl>
        </div>

        {/* Hero visual: practice preview */}
        <HeroPreview />
      </section>

      {/* ── Why Signetix ─────────────────────────────────────────────────── */}
      <section>
        <SectionEyebrow>Why Signetix</SectionEyebrow>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight md:text-4xl">
          Plenty of apps teach <span className="text-muted">ASL</span>. Almost none let you{" "}
          <span className="text-gradient">practise MSL</span>.
        </h2>

        <div className="mt-9 grid gap-5 md:grid-cols-3">
          <GapCard
            n="01"
            title="MSL is overlooked"
            body="A flood of American Sign Language apps — and next to nothing built for Malaysian Sign Language learners."
          />
          <GapCard
            n="02"
            title="Translation, not training"
            body="Most tools stop at text-to-sign and sign-to-text. They show you a sign; they never check yours."
          />
          <GapCard
            n="03"
            title="No real feedback"
            body="Real practice means signing and being told, right away, whether you got it right. That loop was missing."
          />
        </div>

        {/* Opportunity */}
        <div className="border-gradient mt-6 overflow-hidden rounded-2xl">
          <div className="grid gap-6 p-7 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-mint">
                <SparkIcon width={14} height={14} /> The opportunity
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">
                A practice platform that fills the gap.
              </h3>
              <p className="mt-3 max-w-xl text-muted">
                Signetix turns your webcam into a patient practice partner. Lessons aren't locked to
                a fixed syllabus — flexible modules let you rehearse the sentences that matter, and
                developers can keep adding more.
              </p>
            </div>
            <Link
              to="/practice"
              className="btn-gradient inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold md:w-auto"
            >
              Start practising <ArrowRight width={18} height={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Collaboration ────────────────────────────────────────────────── */}
      <section className="glass overflow-hidden rounded-2xl p-8 md:p-10">
        <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-center">
          <div>
            <SectionEyebrow>Collaboration</SectionEyebrow>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
              Built by four people. Growing with help from many.
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              Signetix is an informal, community-driven project, so our library of MSL glosses is
              still small. If you'd like to help us collect sign data and grow the model, we'd love
              to hear from you.
            </p>
          </div>
          <Link
            to="/contact"
            className="btn-ghost inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold md:w-auto"
          >
            <MailIcon width={18} height={18} /> Get in touch
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
      {/* glow */}
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(closest-side,rgba(229,64,141,0.22),transparent)]" />
      <div className="glass relative overflow-hidden rounded-2xl p-5 shadow-glow">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-mint" /> live session
          </span>
          <span className="font-mono text-[11px] text-muted">module · greetings</span>
        </div>

        <div className="mt-4 grid grid-cols-[1.4fr_1fr] gap-4">
          {/* faux webcam */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-hairline">
            <img
              src="/brand/background/background4.jpg"
              alt="Signing the I-Love-You handshape"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void/85 via-transparent to-void/30" />
            <div className="absolute inset-0 mix-blend-multiply bg-gradient-to-tr from-azure/20 via-transparent to-magenta/20" />
            <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-void/70 px-2 py-1 font-mono text-[10px] text-muted backdrop-blur">
              <CameraIcon width={12} height={12} className="text-azure" /> you
            </div>
          </div>

          {/* ring */}
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-hairline bg-void/30 p-3">
            <CircularProgress value={0.86} size={132} stroke={11} passed label="apa khabar" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-mint">
              gloss locked ✓
            </span>
          </div>
        </div>

        {/* gloss sequence */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
          <GlossChip state="done">HI</GlossChip>
          <GlossChip state="done">APA KHABAR</GlossChip>
          <GlossChip state="active">BAIK</GlossChip>
          <GlossChip state="todo">PANDAI</GlossChip>
        </div>
      </div>
    </div>
  );
}

function GlossChip({ children, state }: { children: React.ReactNode; state: "done" | "active" | "todo" }) {
  const cls =
    state === "done"
      ? "border-mint/40 bg-mint/10 text-mint"
      : state === "active"
      ? "border-magenta/50 bg-magenta/10 text-ink shadow-[0_0_18px_rgba(229,64,141,0.25)]"
      : "border-hairline bg-void/40 text-muted";
  return (
    <span className={`shrink-0 rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold tracking-wide ${cls}`}>
      {children}
    </span>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-display text-2xl font-extrabold tracking-tight">{value}</dt>
      <dd className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{label}</dd>
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
      <span className="h-px w-7 bg-gradient-to-r from-azure to-magenta" />
      {children}
    </span>
  );
}

function GapCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="card-hover glass rounded-2xl p-6">
      <span className="font-mono text-sm font-bold text-azure/80">{n}</span>
      <h3 className="mt-3 font-display text-lg font-bold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-4 border-t border-hairline pt-8">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <LogoMark size={32} />
          <div>
            <div className="font-display font-extrabold tracking-tight">Signetix</div>
            <div className="font-mono text-[11px] text-muted">Malaysian Sign Language · live practice</div>
          </div>
        </div>
        <div className="text-sm text-muted">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted/80">Contact us</div>
          <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
            <a href="mailto:khangwei2015@gmail.com" className="text-ink hover:text-azure">
              khangwei2015@gmail.com
            </a>
            <a href="tel:+60139799998" className="text-ink hover:text-azure">
              +60 13-979 9998
            </a>
          </div>
        </div>
      </div>
      <p className="mt-6 font-mono text-[11px] text-muted/60">
        © {new Date().getFullYear()} Signetix · An informal MSL learning platform.
      </p>
    </footer>
  );
}
