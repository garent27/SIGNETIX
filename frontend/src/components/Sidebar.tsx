import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../state/AppContext";
import { getCategories } from "../lib/api";
import type { Category } from "../lib/types";
import { LogoMark } from "./Logo";
import {
  ChevronLeft,
  ChevronRight,
  DevIcon,
  HomeIcon,
  MailIcon,
  PracticeIcon,
  SettingsIcon,
} from "./icons";

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, isDeveloper, setMode } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories(isDeveloper).then(setCategories).catch(() => setCategories([]));
  }, [isDeveloper]);

  const onPractice = pathname.startsWith("/practice");
  const width = sidebarOpen ? 274 : 80;

  const itemClass = (active: boolean) =>
    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
      active ? "text-ink" : "text-muted hover:text-ink"
    }`;

  const activeBg = (active: boolean) =>
    active
      ? "absolute inset-0 rounded-xl bg-azure/10 border border-azure/30 shadow-[inset_0_0_22px_rgba(61,139,255,0.12)]"
      : "absolute inset-0 rounded-xl border border-transparent group-hover:bg-white/[0.03]";

  return (
    <aside
      className="relative z-20 hidden md:block shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ width }}
    >
      <div className="sticky top-0 h-screen p-3">
        <div className="glass relative flex h-full flex-col rounded-2xl">
          {/* Toggle chevron — right & centre of the sidebar edge */}
          <button
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="absolute -right-3 top-1/2 z-30 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-full bg-float text-ink border border-hairline shadow-lg hover:border-azure/60 hover:text-azure transition-colors"
          >
            {sidebarOpen ? <ChevronLeft width={16} height={16} /> : <ChevronRight width={16} height={16} />}
          </button>

          {/* Brand */}
          <div className="flex items-center gap-3 px-4 pt-5 pb-4">
            <LogoMark size={34} />
            {sidebarOpen && (
              <span className="font-display text-lg font-extrabold tracking-tight">Signetix</span>
            )}
          </div>

          <div className="mx-3 h-px bg-hairline/70" />

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <NavItem to="/" icon={<HomeIcon />} label="Home" open={sidebarOpen} end />

            {/* Practice + category sub-items */}
            <div>
              <NavLink to="/practice" className={() => itemClass(onPractice)}>
                <span className={activeBg(onPractice)} />
                <span className="relative grid place-items-center"><PracticeIcon /></span>
                {sidebarOpen && <span className="relative">Practice</span>}
                {onPractice && (
                  <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-gradient-to-r from-azure to-magenta" />
                )}
              </NavLink>

              {sidebarOpen && (
                <ul className="mt-1 mb-1 ml-5 border-l border-hairline/70 pl-3 space-y-0.5">
                  {categories.length === 0 && (
                    <li className="px-2 py-1.5 text-xs text-muted/70">No categories yet</li>
                  )}
                  {categories.map((c) => {
                    const active = pathname === `/practice/${c.id}`;
                    return (
                      <li key={c.id}>
                        <Link
                          to={`/practice/${c.id}`}
                          className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors ${
                            active ? "text-azure" : "text-muted hover:text-ink"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              active ? "bg-azure" : "bg-hairline"
                            } ${c.status === 0 ? "ring-1 ring-ember/50" : ""}`}
                          />
                          <span className="truncate">{c.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {isDeveloper && (
              <NavItem to="/developer" icon={<DevIcon />} label="Developer mode" open={sidebarOpen} />
            )}
            <NavItem to="/contact" icon={<MailIcon />} label="Contact" open={sidebarOpen} />
            <NavItem to="/settings" icon={<SettingsIcon />} label="Settings" open={sidebarOpen} />
          </nav>

          {/* Footer: mode pill */}
          <div className="px-3 pb-4">
            <div className="mx-1 mb-3 h-px bg-hairline/70" />
            {sidebarOpen ? (
              <div className="rounded-xl border border-hairline bg-void/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    Mode
                  </span>
                  <span
                    className={`font-mono text-[11px] font-semibold ${
                      isDeveloper ? "text-ember" : "text-mint"
                    }`}
                  >
                    {isDeveloper ? "DEVELOPER" : "LEARNER"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMode(isDeveloper ? "user" : "developer");
                    navigate("/");
                  }}
                  className="btn-ghost mt-2.5 w-full rounded-lg py-1.5 text-xs font-semibold"
                >
                  Switch to {isDeveloper ? "Learner" : "Developer"}
                </button>
              </div>
            ) : (
              <div
                className={`grid place-items-center h-9 rounded-xl border ${
                  isDeveloper ? "border-ember/40 text-ember" : "border-mint/40 text-mint"
                }`}
                title={isDeveloper ? "Developer mode" : "Learner mode"}
              >
                <span className="font-mono text-xs font-bold">{isDeveloper ? "DEV" : "USR"}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  to,
  icon,
  label,
  open,
  end,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  open: boolean;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      title={open ? undefined : label}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive ? "text-ink" : "text-muted hover:text-ink"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={
              isActive
                ? "absolute inset-0 rounded-xl bg-azure/10 border border-azure/30 shadow-[inset_0_0_22px_rgba(61,139,255,0.12)]"
                : "absolute inset-0 rounded-xl border border-transparent group-hover:bg-white/[0.03]"
            }
          />
          <span className="relative grid place-items-center">{icon}</span>
          {open && <span className="relative">{label}</span>}
          {isActive && open && (
            <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-gradient-to-r from-azure to-magenta" />
          )}
        </>
      )}
    </NavLink>
  );
}
