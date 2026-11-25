import React from 'react';

export const HrmsIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full max-w-2xl mx-auto flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 760 540"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-2xl"
      >
        <defs>
          <linearGradient id="domeGrad" x1="380" y1="60" x2="380" y2="480" gradientUnits="userSpaceOnUse">
            <stop stopColor="#144272" stopOpacity="0.85" />
            <stop offset="1" stopColor="#0c2f55" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="screenBody" x1="150" y1="90" x2="610" y2="410" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="1" stopColor="#f8fafc" />
          </linearGradient>

          <linearGradient id="screenHdr" x1="150" y1="90" x2="610" y2="130" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f1f5f9" />
            <stop offset="1" stopColor="#e2e8f0" />
          </linearGradient>

          <linearGradient id="hrmsTextGrad" x1="260" y1="210" x2="500" y2="280" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563eb" />
            <stop offset="0.5" stopColor="#1d4ed8" />
            <stop offset="1" stopColor="#1e3a8a" />
          </linearGradient>

          <linearGradient id="goldCoinGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fde047" />
            <stop offset="0.4" stopColor="#f59e0b" />
            <stop offset="1" stopColor="#b45309" />
          </linearGradient>

          <linearGradient id="shirtBlue" x1="0" y1="0" x2="0" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>

          <linearGradient id="pantsNavy" x1="0" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e293b" />
            <stop offset="1" stopColor="#091428" />
          </linearGradient>

          <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#051933" floodOpacity="0.25" />
          </filter>

          <filter id="popShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.18" />
          </filter>
        </defs>

        <circle cx="380" cy="275" r="235" fill="url(#domeGrad)" />
        <ellipse cx="380" cy="460" rx="290" ry="24" fill="#051d38" opacity="0.6" />

        <g opacity="0.35" fill="#60a5fa">
          <circle cx="485" cy="82" r="18" fill="#3b82f6" opacity="0.4" />
          <path d="M481 60 h8 v8 h-8 z M481 96 h8 v8 h-8 z M463 78 v8 h8 v-8 z M499 78 v8 h8 v-8 z" />
          <circle cx="485" cy="82" r="8" fill="#072b53" />
        </g>
        <g opacity="0.25" fill="#93c5fd">
          <circle cx="270" cy="95" r="14" fill="#60a5fa" opacity="0.3" />
          <path d="M267 78 h6 v6 h-6 z M267 106 h6 v6 h-6 z M253 92 v6 h6 v-6 z M281 92 v6 h6 v-6 z" />
          <circle cx="270" cy="95" r="6" fill="#072b53" />
        </g>

        {/* Monitor Base Stand */}
        <path d="M340 405 L420 405 L435 450 L325 450 Z" fill="#94a3b8" />
        <ellipse cx="380" cy="452" rx="80" ry="10" fill="#64748b" opacity="0.8" />
        <ellipse cx="380" cy="452" rx="72" ry="7" fill="#cbd5e1" opacity="0.9" />

        {/* Screen Bezel */}
        <rect
          x="145"
          y="88"
          width="470"
          height="325"
          rx="24"
          fill="url(#screenBody)"
          stroke="#cbd5e1"
          strokeWidth="6"
          filter="url(#cardShadow)"
        />

        {/* Screen Header Bar */}
        <path
          d="M145 112 C145 98.7 155.7 88 169 88 L591 88 C604.3 88 615 98.7 615 112 L615 125 L145 125 Z"
          fill="url(#screenHdr)"
        />
        <circle cx="172" cy="106" r="5" fill="#f87171" />
        <circle cx="188" cy="106" r="5" fill="#fbbf24" />
        <circle cx="204" cy="106" r="5" fill="#34d399" />
        <rect x="230" y="99" width="180" height="15" rx="7.5" fill="#ffffff" opacity="0.9" />
        <rect x="242" y="104" width="70" height="5" rx="2.5" fill="#cbd5e1" />

        {/* Screen Text: HRMS */}
        <text
          x="380"
          y="248"
          textAnchor="middle"
          fill="url(#hrmsTextGrad)"
          fontSize="68"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="4"
          filter="url(#popShadow)"
        >
          HRMS
        </text>

        {/* Screen Full Form Badge */}
        <g transform="translate(195, 268)">
          <rect
            x="0"
            y="0"
            width="370"
            height="26"
            rx="13"
            fill="#eff6ff"
            stroke="#bfdbfe"
            strokeWidth="1.2"
          />
          <text
            x="185"
            y="17"
            textAnchor="middle"
            fill="#1e40af"
            fontSize="11.5"
            fontWeight="800"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="2.2"
          >
            HUMAN RESOURCE MANAGEMENT SYSTEM
          </text>
        </g>

        <text
          x="380"
          y="312"
          textAnchor="middle"
          fill="#64748b"
          fontSize="10"
          fontWeight="600"
          letterSpacing="1"
        >
          MARK ANTHONY VENTURES &bull; ENTERPRISE WORKFORCE
        </text>

        {/* Profile Badge */}
        <g transform="translate(180, 142)" filter="url(#popShadow)">
          <g transform="translate(8, -12)">
            {[0, 12, 24, 36, 48].map((offset, idx) => (
              <polygon
                key={idx}
                points={`${offset + 5},0 ${offset + 6.5},3.5 ${offset + 10},3.8 ${offset + 7.5},6.2 ${offset + 8.2},9.8 ${offset + 5},7.8 ${offset + 1.8},9.8 ${offset + 2.5},6.2 ${offset},3.8 ${offset + 3.5},3.5`}
                fill="#f59e0b"
              />
            ))}
          </g>
          <rect x="0" y="0" width="76" height="66" rx="12" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="38" cy="26" r="14" fill="#0284c7" />
          <path d="M26 54 c0 -7 6 -11 12 -11 s12 4 12 11" fill="#0284c7" />
          <circle cx="50" cy="18" r="5" fill="#10b981" />
          <path d="M48 18 l1.5 1.5 l3 -3" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* Reaction widgets */}
        <g transform="translate(485, 170)" filter="url(#popShadow)">
          <rect x="0" y="0" width="46" height="34" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
          <path d="M20 34 L26 40 L28 34 Z" fill="#ffffff" />
          <path
            d="M17 25 v-8 h3 l4 -6 c1.5 0 2.5 1 2.5 2 v2 h4 c1.2 0 2 0.8 2 2 v6 c0 1.2 -0.8 2 -2 2 h-9.5"
            fill="#3b82f6"
            stroke="#2563eb"
            strokeWidth="0.8"
          />
        </g>

        <g transform="translate(492, 230)" filter="url(#popShadow)">
          <circle cx="15" cy="15" r="15" fill="#f43f5e" />
          <path
            d="M15 22.5 L13.5 21 C8.5 16.5 5 13.5 5 10 C5 7.2 7.2 5 10 5 C11.6 5 13.2 5.8 15 7.1 C16.8 5.8 18.4 5 20 5 C22.8 5 25 7.2 25 10 C25 13.5 21.5 16.5 16.5 21 L15 22.5 Z"
            fill="#ffffff"
          />
        </g>

        <g transform="translate(470, 275)" filter="url(#popShadow)">
          <rect x="0" y="0" width="58" height="26" rx="8" fill="#38bdf8" />
          <circle cx="16" cy="13" r="2.5" fill="#ffffff" />
          <circle cx="29" cy="13" r="2.5" fill="#ffffff" />
          <circle cx="42" cy="13" r="2.5" fill="#ffffff" />
        </g>

        {/* Growth Chart */}
        <g transform="translate(180, 318)">
          <rect x="0" y="45" width="12" height="30" rx="3" fill="#93c5fa" />
          <rect x="18" y="30" width="12" height="45" rx="3" fill="#60a5fa" />
          <rect x="36" y="15" width="12" height="60" rx="3" fill="#3b82f6" />
          <rect x="54" y="0" width="12" height="75" rx="3" fill="#1d4ed8" />
          <polyline points="6,40 24,26 42,12 60,-4" fill="none" stroke="#ef4444" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="60" cy="-4" r="4.5" fill="#ef4444" />
        </g>

        {/* Gold Coins */}
        <g transform="translate(290, 155)" filter="url(#popShadow)">
          <circle cx="18" cy="18" r="18" fill="url(#goldCoinGrad)" stroke="#fef3c7" strokeWidth="2.5" />
          <circle cx="18" cy="18" r="14" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 2" />
          <text x="18" y="24" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900" fontFamily="serif">M</text>
        </g>

        <g transform="translate(90, 355)" filter="url(#popShadow)">
          <circle cx="16" cy="16" r="16" fill="url(#goldCoinGrad)" stroke="#fef3c7" strokeWidth="2" />
          <text x="16" y="21.5" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="serif">M</text>
        </g>

        <g transform="translate(565, 345)" filter="url(#popShadow)">
          <circle cx="17" cy="17" r="17" fill="url(#goldCoinGrad)" stroke="#fef3c7" strokeWidth="2" />
          <text x="17" y="22.5" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900" fontFamily="serif">M</text>
        </g>

        {/* Characters */}
        <g transform="translate(115, 260)" filter="url(#popShadow)">
          <circle cx="56" cy="30" r="19" fill="#0f172a" />
          <ellipse cx="50" cy="42" rx="10" ry="18" fill="#0f172a" />
          <circle cx="60" cy="32" r="13" fill="#fed7aa" />
          <circle cx="42" cy="26" r="8" fill="#0f172a" />
          <path d="M48 48 L76 48 L82 115 L44 115 Z" fill="url(#shirtBlue)" />
          <polygon points="56,48 62,62 68,48" fill="#ffffff" />
          <path d="M44 115 L62 115 L60 215 L44 215 Z" fill="url(#pantsNavy)" />
          <path d="M64 115 L82 115 L80 215 L64 215 Z" fill="url(#pantsNavy)" />
          <ellipse cx="51" cy="217" rx="10" ry="4.5" fill="#020617" />
          <ellipse cx="73" cy="217" rx="10" ry="4.5" fill="#020617" />
          <rect x="74" y="65" width="22" height="34" rx="4" fill="#1e293b" />
          <rect x="76" y="68" width="18" height="28" rx="2" fill="#ffffff" />
          <path d="M68 54 L80 75" stroke="#fed7aa" strokeWidth="5.5" strokeLinecap="round" />
        </g>

        <g transform="translate(370, 310)" filter="url(#popShadow)">
          <path d="M58 105 L58 165" stroke="#64748b" strokeWidth="4.5" strokeLinecap="round" />
          <ellipse cx="58" cy="167" rx="18" ry="5" fill="#475569" />
          <path d="M42 105 L74 105" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
          <circle cx="62" cy="38" r="14" fill="#020617" />
          <circle cx="62" cy="40" r="12" fill="#fed7aa" />
          <path d="M48 56 L78 56 L74 112 L46 112 Z" fill="url(#shirtBlue)" />
          <path d="M47 112 L73 112 L72 165 L54 165 Z" fill="url(#pantsNavy)" />
          <ellipse cx="64" cy="168" rx="10" ry="4" fill="#020617" />
          <path d="M12 90 L44 90 L40 108 L8 108 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.2" />
          <rect x="15" y="70" width="28" height="20" rx="3" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
          <path d="M50 62 L32 88 L42 90" stroke="#fed7aa" strokeWidth="5" strokeLinecap="round" />
        </g>

        <g transform="translate(480, 265)" filter="url(#popShadow)">
          <circle cx="44" cy="28" r="14" fill="#0f172a" />
          <circle cx="44" cy="30" r="12" fill="#fcd34d" />
          <path d="M32 46 L60 46 L64 115 L28 115 Z" fill="url(#shirtBlue)" />
          <path d="M30 115 L46 115 L44 212 L30 212 Z" fill="url(#pantsNavy)" />
          <path d="M48 115 L64 115 L62 212 L48 212 Z" fill="url(#pantsNavy)" />
          <ellipse cx="36" cy="214" rx="10" ry="4.5" fill="#020617" />
          <ellipse cx="57" cy="214" rx="10" ry="4.5" fill="#020617" />
          <rect x="14" y="68" width="20" height="28" rx="3" fill="#1e293b" />
          <path d="M36 52 L22 75" stroke="#fcd34d" strokeWidth="4.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};
