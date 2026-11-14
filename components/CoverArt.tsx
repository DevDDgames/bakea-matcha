// Visuel par défaut (en attendant une vraie photo, remplaçable depuis l'admin).
export default function CoverArt() {
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" role="img" aria-label="Pot de pâte à tartiner matcha Bakea">
      <defs>
        <mask id="bakea-logo" style={{ maskType: 'alpha' }}>
          <image href="/logo.png" x="122" y="28" width="156" height="57.5" />
        </mask>
      </defs>
      <rect width="400" height="400" fill="#f6efe1" />
      <rect x="122" y="28" width="156" height="58" fill="#ff4a1c" mask="url(#bakea-logo)" />
      {/* pot */}
      <g transform="translate(200 230)">
        <ellipse cx="0" cy="92" rx="92" ry="12" fill="#2a1d12" opacity=".08" />
        <rect x="-78" y="-70" width="156" height="34" rx="10" fill="#ff4a1c" stroke="#2a1d12" strokeWidth="4" />
        <path d="M-66 -66 v26 M-44 -66 v26 M-22 -66 v26 M0 -66 v26 M22 -66 v26 M44 -66 v26 M66 -66 v26" stroke="#2a1d12" strokeWidth="2.5" opacity=".35" />
        <rect x="-74" y="-36" width="148" height="124" rx="22" fill="#e6eccf" stroke="#2a1d12" strokeWidth="4" />
        <path d="M-70 -6 q35 -16 70 0 t70 0 v70 q0 22 -22 22 h-96 q-22 0 -22 -22z" fill="#7d9b3c" />
        <rect x="-52" y="4" width="104" height="58" rx="10" fill="#fffaf0" stroke="#2a1d12" strokeWidth="3" />
        <text x="0" y="30" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontWeight="800" fontSize="20" fill="#2a1d12">matcha</text>
        <text x="0" y="50" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="11" fill="#ff4a1c" letterSpacing="1">200 ML</text>
        {/* petit visage façon doodle */}
        <circle cx="-32" cy="-18" r="3.5" fill="#2a1d12" />
        <circle cx="32" cy="-18" r="3.5" fill="#2a1d12" />
        <path d="M-8 -16 q8 8 16 0" stroke="#2a1d12" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* feuilles */}
        <path d="M96 -40 q30 -30 50 -6 q-26 22 -50 6z" fill="#7d9b3c" stroke="#2a1d12" strokeWidth="3" />
        <path d="M-96 -20 q-34 -22 -48 6 q28 16 48 -6z" fill="#7d9b3c" stroke="#2a1d12" strokeWidth="3" />
      </g>
      <text x="200" y="372" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontStyle="italic" fontSize="22" fill="#ff4a1c">Pâte à tartiner · Matcha · Noël</text>
    </svg>
  );
}
