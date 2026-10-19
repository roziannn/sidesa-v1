const WINDOWS = [
  { x: 128, y: 214, d: "0s" },
  { x: 232, y: 224, d: "1.1s" },
  { x: 352, y: 206, d: "2.2s" },
  { x: 470, y: 222, d: "0.6s" },
];

const NODES = [
  { x: 150, y: 120, d: "0s" },
  { x: 290, y: 78, d: "0.8s" },
  { x: 410, y: 108, d: "1.6s" },
];

export default function VillageScene() {
  return (
    <svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 w-full h-[46%] pointer-events-none" aria-hidden>
      {/* Matahari */}
      <g className="village-sun">
        <circle cx="500" cy="90" r="46" fill="#bef264" opacity="0.15" />
        <circle cx="500" cy="90" r="28" fill="#d9f99d" opacity="0.5" />
      </g>

      {/* Awan */}
      <g className="village-cloud" opacity="0.18" fill="#fff">
        <ellipse cx="60" cy="60" rx="34" ry="10" />
        <ellipse cx="82" cy="52" rx="22" ry="9" />
      </g>
      <g className="village-cloud [animation-delay:-28s] [animation-duration:80s]" opacity="0.12" fill="#fff">
        <ellipse cx="60" cy="120" rx="28" ry="8" />
        <ellipse cx="78" cy="113" rx="18" ry="7" />
      </g>

      {/* Jaringan digital */}
      <g stroke="#6ee7b7" strokeWidth="1.2" fill="none" opacity="0.5">
        <path className="village-link" d="M150 120 L290 78 L410 108" />
        <path className="village-link" d="M150 120 L132 205" />
        <path className="village-link" d="M290 78 L238 215" />
        <path className="village-link" d="M410 108 L358 198" />
      </g>
      {NODES.map((n) => (
        <g key={n.x}>
          <circle className="village-node-ring" cx={n.x} cy={n.y} r="4" fill="#6ee7b7" style={{ animationDelay: n.d }} />
          <circle cx={n.x} cy={n.y} r="4" fill="#a7f3d0" />
        </g>
      ))}

      {/* Bukit */}
      <path d="M0 230 Q120 170 260 220 T600 200 V300 H0 Z" fill="#0a4a3c" opacity="0.7" />
      <path d="M0 260 Q150 215 300 255 T600 240 V300 H0 Z" fill="#06362c" />

      {/* Rumah */}
      <g fill="#04201b">
        <path d="M110 250 V205 L138 185 L166 205 V250 Z" />
        <path d="M215 255 V215 L240 198 L265 215 V255 Z" />
        <path d="M335 250 V198 L365 176 L395 198 V250 Z" />
        <path d="M450 258 V214 L476 196 L502 214 V258 Z" />
      </g>
      <g fill="#fde68a">
        {WINDOWS.map((w) => (
          <rect key={w.x} className="village-window" x={w.x} y={w.y} width="9" height="9" rx="1.5" style={{ animationDelay: w.d }} />
        ))}
      </g>

      {/* Pohon */}
      {[70, 300, 548].map((x, i) => (
        <g key={x} className="village-tree" style={{ animationDelay: `${i * 0.7}s` }}>
          <rect x={x - 2} y="240" width="4" height="22" fill="#04201b" />
          <circle cx={x} cy="232" r="16" fill="#0b6b52" />
          <circle cx={x - 8} cy="240" r="11" fill="#0b6b52" />
          <circle cx={x + 9} cy="240" r="11" fill="#0b6b52" />
        </g>
      ))}

      <path d="M0 280 Q200 262 400 278 T600 270 V300 H0 Z" fill="#031812" />
    </svg>
  );
}
