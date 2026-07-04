import { Link } from "react-router-dom";

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <img
      src="/brand/Signetix_logo.png"
      alt="Signetix"
      width={size}
      height={size}
      className="object-contain drop-shadow-[0_4px_14px_rgba(229,64,141,0.35)]"
      style={{ width: size, height: size }}
    />
  );
}

export function Wordmark({
  size = 36,
  to = "/",
  showTagline = false,
}: {
  size?: number;
  to?: string;
  showTagline?: boolean;
}) {
  return (
    <Link to={to} className="flex items-center gap-3 group">
      <LogoMark size={size} />
      <span className="leading-none">
        <span className="block font-display font-extrabold tracking-tight text-ink text-xl">
          Signetix
        </span>
        {showTagline && (
          <span className="block font-mono text-[10px] uppercase tracking-[0.32em] text-muted mt-1">
            MSL · live practice
          </span>
        )}
      </span>
    </Link>
  );
}
