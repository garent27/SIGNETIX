import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import Constellation from "./Constellation";
import { useApp } from "../state/AppContext";

export default function AppLayout() {
  const { sidebarOpen } = useApp();
  const { pathname } = useLocation();

  // Scroll content to top on route change.
  useEffect(() => {
    document.getElementById("app-scroll")?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="relative min-h-screen text-ink">
      {/* Ambient signature layer */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Constellation className="h-full w-full opacity-[0.55]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />
        <main
          id="app-scroll"
          className="h-screen flex-1 overflow-y-auto"
          style={{ scrollPaddingTop: "2rem" }}
        >
          <div
            className="mx-auto w-full max-w-[1180px] px-6 md:px-10 py-10"
            key={sidebarOpen ? "open" : "closed"}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
