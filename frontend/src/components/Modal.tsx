import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./icons";

export default function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-void/80 backdrop-blur-md" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`glass relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl shadow-glow animate-fade-up ${
          wide ? "max-w-2xl" : "max-w-lg"
        }`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-hairline text-muted hover:border-azure/50 hover:text-ink"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="border-t border-hairline px-6 py-4">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}
