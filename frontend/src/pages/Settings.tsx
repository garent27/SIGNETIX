import { useState } from "react";
import { useApp } from "../state/AppContext";

export default function Settings() {
  const { isDeveloper } = useApp();
  return (
    <div className="animate-fade-up space-y-8">
      <header className="max-w-2xl">
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">Settings</span>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">Preferences</h1>
        <p className="mt-3 text-muted">
          A preview of what you'll be able to tune. These controls are for display only in this
          MVP.
        </p>
      </header>

      <SettingsGroup title="Practice" desc="How the camera and scoring behave during a session.">
        <ToggleRow label="Mirror my camera" desc="Flip the webcam horizontally like a mirror." defaultOn />
        <ToggleRow label="Show top-5 predictions" desc="Display the model's other guesses while you sign." defaultOn />
        <SelectRow label="Pass threshold" value="80%" options={["70%", "75%", "80%", "85%"]} />
      </SettingsGroup>

      <SettingsGroup title="Privacy" desc="Your camera stays on your device unless you're in a live session.">
        <ToggleRow label="Process video on device only" desc="Never stream frames when the model is offline." defaultOn />
        <ToggleRow label="Save practice history" desc="Keep a local record of completed modules." />
      </SettingsGroup>

      <SettingsGroup title="Notifications" desc="Stay in the loop about new content.">
        <ToggleRow label="New categories & modules" defaultOn />
        <ToggleRow label="Product updates" />
      </SettingsGroup>

      <SettingsGroup title="Account" desc="Your current session.">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-ink">Active mode</div>
            <div className="text-sm text-muted">
              You're signed in as a {isDeveloper ? "developer" : "learner"}.
            </div>
          </div>
          <span
            className={`rounded-full border px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider ${
              isDeveloper ? "border-ember/40 text-ember" : "border-mint/40 text-mint"
            }`}
          >
            {isDeveloper ? "Developer" : "Learner"}
          </span>
        </div>
      </SettingsGroup>
    </div>
  );
}

function SettingsGroup({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass overflow-hidden rounded-2xl">
      <div className="border-b border-hairline px-5 py-4">
        <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted">{desc}</p>
      </div>
      <div className="divide-y divide-hairline/70">{children}</div>
    </section>
  );
}

function ToggleRow({ label, desc, defaultOn = false }: { label: string; desc?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div>
        <div className="text-sm font-semibold text-ink">{label}</div>
        {desc && <div className="text-sm text-muted">{desc}</div>}
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn((v) => !v)}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
          on ? "border-transparent bg-brand-gradient" : "border-hairline bg-void/60"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-ink transition-transform ${
            on ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
          style={{ height: 18, width: 18 }}
        />
      </button>
    </div>
  );
}

function SelectRow({ label, value, options }: { label: string; value: string; options: string[] }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="text-sm font-semibold text-ink">{label}</div>
      <select
        defaultValue={value}
        className="rounded-lg border border-hairline bg-void/60 px-3 py-1.5 text-sm text-ink outline-none focus:border-azure/60"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
