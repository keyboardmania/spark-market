import type { Motif, Palette } from "@/data/mockData";

type ProductVisualProps = {
  motif: Motif;
  palette: Palette;
  ip: string;
  uid: string;
  imageUrl?: string;
  alt?: string;
  className?: string;
  showLabel?: boolean;
};

export function ProductVisual({ motif, palette, ip, uid, imageUrl, alt = "", className = "", showLabel = true }: ProductVisualProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(180deg, ${palette.soft} 0%, ${palette.base} 68%, #ffffff 100%)`,
      }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-[12%]">
          {motif === "card" ? <CardArt palette={palette} uid={uid} /> : null}
          {motif === "figure" ? <FigureArt palette={palette} uid={uid} /> : null}
          {motif === "plush" ? <PlushArt palette={palette} /> : null}
          {motif === "pouch" ? <PouchArt palette={palette} /> : null}
        </div>
      )}
      {imageUrl || !showLabel ? null : (
        <p
          className="pointer-events-none absolute bottom-3 left-3 text-[10px] font-medium tracking-[0.16em]"
          style={{ color: palette.ink }}
        >
          {ip}
        </p>
      )}
    </div>
  );
}

function CardArt({ palette, uid }: { palette: Palette; uid: string }) {
  const holo = `holo-${uid}`;

  return (
    <svg viewBox="0 0 160 214" className="h-[86%] w-auto drop-shadow-[0_16px_28px_rgba(15,23,42,0.12)]" aria-hidden>
      <rect x="10" y="8" width="140" height="198" rx="16" fill="#ffffff" />
      <rect x="22" y="20" width="116" height="132" rx="12" fill={palette.accent} />
      <rect x="22" y="20" width="42" height="132" fill={`url(#${holo})`} opacity="0.45" />
      <circle cx="80" cy="86" r="28" fill="#ffffff" />
      <circle cx="80" cy="86" r="14" fill={palette.ink} opacity="0.85" />
      <rect x="32" y="166" width="74" height="8" rx="4" fill={palette.ink} opacity="0.28" />
      <rect x="32" y="182" width="46" height="6" rx="3" fill={palette.ink} opacity="0.16" />
      <defs>
        <linearGradient id={holo} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor={palette.soft} />
          <stop offset="1" stopColor={palette.accent} />
        </linearGradient>
      </defs>
    </svg>
  );
}

function FigureArt({ palette, uid }: { palette: Palette; uid: string }) {
  const shine = `shine-${uid}`;

  return (
    <svg viewBox="0 0 180 210" className="h-[88%] w-auto drop-shadow-[0_16px_24px_rgba(15,23,42,0.1)]" aria-hidden>
      <ellipse cx="90" cy="186" rx="46" ry="10" fill={palette.ink} opacity="0.08" />
      <rect x="58" y="168" width="64" height="14" rx="7" fill="#ffffff" />
      <path d="M70 168c4-38 10-58 20-70 10 12 16 32 20 70" fill={palette.ink} opacity="0.88" />
      <path d="M78 150c8 8 16 8 24 0" fill={palette.accent} />
      <circle cx="90" cy="78" r="28" fill={palette.accent} />
      <circle cx="90" cy="74" r="16" fill={`url(#${shine})`} />
      <circle cx="82" cy="76" r="2.2" fill={palette.ink} />
      <circle cx="98" cy="76" r="2.2" fill={palette.ink} />
      <path d="M84 84c4 4 8 4 12 0" stroke={palette.ink} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <defs>
        <radialGradient id={shine}>
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor={palette.soft} />
        </radialGradient>
      </defs>
    </svg>
  );
}

function PlushArt({ palette }: { palette: Palette }) {
  return (
    <svg viewBox="0 0 180 190" className="h-[84%] w-auto drop-shadow-[0_16px_24px_rgba(15,23,42,0.1)]" aria-hidden>
      <ellipse cx="90" cy="168" rx="40" ry="8" fill={palette.ink} opacity="0.08" />
      <circle cx="58" cy="58" r="22" fill={palette.accent} />
      <circle cx="122" cy="58" r="22" fill={palette.accent} />
      <circle cx="58" cy="58" r="10" fill="#ffffff" opacity="0.8" />
      <circle cx="122" cy="58" r="10" fill="#ffffff" opacity="0.8" />
      <ellipse cx="90" cy="108" rx="52" ry="48" fill={palette.accent} />
      <ellipse cx="90" cy="118" rx="28" ry="24" fill="#ffffff" opacity="0.88" />
      <circle cx="74" cy="104" r="4" fill={palette.ink} />
      <circle cx="106" cy="104" r="4" fill={palette.ink} />
      <circle cx="66" cy="116" r="6" fill="#fda4af" opacity="0.8" />
      <circle cx="114" cy="116" r="6" fill="#fda4af" opacity="0.8" />
      <path d="M84 116c4 5 8 5 12 0" stroke={palette.ink} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function PouchArt({ palette }: { palette: Palette }) {
  return (
    <svg viewBox="0 0 180 180" className="h-[78%] w-auto drop-shadow-[0_16px_24px_rgba(15,23,42,0.1)]" aria-hidden>
      <rect x="38" y="48" width="104" height="104" rx="28" fill="#ffffff" />
      <path d="M48 78c10-24 74-24 84 0" fill={palette.accent} />
      <rect x="48" y="74" width="84" height="58" rx="18" fill={palette.accent} />
      <path d="M78 104c6 8 18 8 24 0" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="90" cy="96" r="4" fill="#ffffff" />
      <rect x="82" y="36" width="16" height="22" rx="6" fill={palette.ink} opacity="0.25" />
    </svg>
  );
}
