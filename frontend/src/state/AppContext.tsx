import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Mode = "user" | "developer";

interface AppState {
  mode: Mode;
  setMode: (m: Mode) => void;
  isDeveloper: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(
    () => (localStorage.getItem("signetix.mode") as Mode) || "user"
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem("signetix.mode", mode);
  }, [mode]);

  const value = useMemo<AppState>(
    () => ({
      mode,
      setMode: setModeState,
      isDeveloper: mode === "developer",
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar: () => setSidebarOpen((v) => !v),
    }),
    [mode, sidebarOpen]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
