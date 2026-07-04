import { useNavigate } from "react-router-dom";
import { useApp, type Mode } from "../state/AppContext";
import { LogoMark } from "../components/Logo";
import Constellation from "../components/Constellation";
import { ArrowRight, BoltIcon } from "../components/icons";

const inputClass =
  "w-full rounded-xl border border-hairline bg-void/50 px-4 py-3 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-azure/60 focus:bg-void/70";

export default function Login() {
  const { setMode } = useApp();
  const navigate = useNavigate();

  const enter = (mode: Mode) => {
    setMode(mode);
    localStorage.setItem("signetix.entered", "1");
    navigate("/");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Atmospheric panel */}
      <aside className="relative hidden overflow-hidden lg:block">
        <img
          src="/brand/background/background2.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-void/70 via-void/55 to-void/90" />
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{
            backgroundImage:
              "radial-gradient(700px 500px at 25% 20%, rgba(61,139,255,0.5), transparent 60%), radial-gradient(700px 600px at 75% 90%, rgba(229,64,141,0.45), transparent 60%)",
          }}
        />
        <Constellation className="absolute inset-0 h-full w-full opacity-50" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <LogoMark size={40} />
            <span className="font-display text-2xl font-extrabold tracking-tight">Signetix</span>
          </div>

          <div className="max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-void/40 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
              <BoltIcon width={13} height={13} className="text-mint" /> Real-time MSL feedback
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight">
              Don't just read signs.{" "}
              <span className="text-gradient">Sign them.</span>
            </h1>
            <p className="mt-4 text-[15px] text-muted">
              Practise Malaysian Sign Language in front of your camera and watch your accuracy
              climb, gloss by gloss, in real time.
            </p>
          </div>

          <p className="font-mono text-xs text-muted/70">Cheap · Effective · User-friendly</p>
        </div>
      </aside>

      {/* Login card */}
      <main className="relative flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <LogoMark size={44} />
            <span className="mt-2 font-display text-2xl font-extrabold">Signetix</span>
          </div>

          <div className="glass rounded-2xl p-7 shadow-glow">
            <h2 className="font-display text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-1 text-sm text-muted">Sign in to continue your practice.</p>

            <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted" htmlFor="email">
                  Email
                </label>
                <input id="email" type="email" placeholder="you@example.com" className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted" htmlFor="password">
                  Password
                </label>
                <input id="password" type="password" placeholder="••••••••" className={inputClass} />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-muted">
                  <input type="checkbox" className="h-4 w-4 rounded border-hairline bg-void accent-azure" />
                  Remember me
                </label>
                <a href="#" className="font-medium text-azure hover:underline">
                  Forgot password?
                </a>
              </div>

              <button type="button" onClick={() => enter("user")} className="btn-gradient w-full rounded-xl py-3 text-sm font-semibold">
                Sign in
              </button>

              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-hairline" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">or</span>
                <span className="h-px flex-1 bg-hairline" />
              </div>

              <button
                type="button"
                className="btn-ghost flex w-full items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-semibold"
              >
                <GoogleGlyph /> Sign in with Google
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-muted">
              Don't have an account?{" "}
              <a href="#" className="font-semibold text-azure hover:underline">
                Sign up
              </a>
            </p>
          </div>

          {/* Direct entry */}
          <div className="mt-5">
            <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Quick start — choose a mode
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => enter("user")}
                className="group flex items-center justify-between rounded-xl border border-mint/30 bg-mint/[0.06] px-4 py-3 text-left transition-colors hover:border-mint/60"
              >
                <span>
                  <span className="block text-sm font-semibold text-ink">Continue as Learner</span>
                  <span className="block text-xs text-muted">Practise signing</span>
                </span>
                <ArrowRight width={18} height={18} className="text-mint transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => enter("developer")}
                className="group flex items-center justify-between rounded-xl border border-ember/30 bg-ember/[0.06] px-4 py-3 text-left transition-colors hover:border-ember/60"
              >
                <span>
                  <span className="block text-sm font-semibold text-ink">Continue as Developer</span>
                  <span className="block text-xs text-muted">Manage content</span>
                </span>
                <ArrowRight width={18} height={18} className="text-ember transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-7.9Z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.8A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.7 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2a11 11 0 0 0 0 9.8l3.7-2.8Z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2 7.1l3.7 2.8C6.6 7.3 9.1 5.4 12 5.4Z" />
    </svg>
  );
}
