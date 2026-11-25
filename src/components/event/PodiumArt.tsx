export function PodiumArt() {
  return (
    <svg viewBox="0 0 400 320" className="h-auto w-full" role="img" aria-label="منصة مناظرة وميكروفون أمام الجمهور">
      {/* audience silhouette */}
      <g className="fill-beige">
        {Array.from({ length: 9 }).map((_, i) => (
          <g key={i} transform={`translate(${i * 46 - 6} ${i % 2 ? 236 : 246})`}>
            <circle cx="24" cy="12" r="15" />
            <path d="M0 74 Q0 30 24 30 Q48 30 48 74 Z" />
          </g>
        ))}
      </g>
      {/* frames */}
      <rect x="82" y="32" width="236" height="186" rx="8" fill="none" className="stroke-border" strokeWidth="1" />
      {/* podium */}
      <path d="M140 120 L260 120 L248 232 L152 232 Z" className="fill-primary" />
      <rect x="130" y="108" width="140" height="16" rx="4" className="fill-navy" />
      <path d="M170 150 L230 150" className="stroke-accent" strokeWidth="4" strokeLinecap="round" />
      <path d="M180 166 L220 166" className="stroke-sage" strokeWidth="3" strokeLinecap="round" />
      {/* microphone */}
      <path d="M200 108 L200 84 Q200 70 214 62" fill="none" className="stroke-navy" strokeWidth="4" strokeLinecap="round" />
      <rect x="208" y="40" width="18" height="30" rx="9" transform="rotate(28 217 55)" className="fill-accent" />
    </svg>
  );
}
