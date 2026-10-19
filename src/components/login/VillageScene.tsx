type House = { x: number; base: number; s: number; layer: 0 | 1 | 2 };

const LAYER = [
  { house: "#0d6b55", hill: "#0a5844", window: "#a7f3d0", opacity: 0.55 },
  { house: "#07443a", hill: "#073f33", window: "#fde68a", opacity: 0.8 },
  { house: "#04201b", hill: "#052a22", window: "#fde68a", opacity: 1 },
] as const;

const HOUSES: House[] = [
  // belakang
  ...[40, 135, 225, 315, 405, 495, 575].map((x, i) => ({ x, base: 214 - (i % 2) * 4, s: 0.55, layer: 0 as const })),
  // tengah
  ...[85, 180, 275, 370, 460, 545].map((x, i) => ({ x, base: 240 - (i % 2) * 3, s: 0.8, layer: 1 as const })),
  // depan
  ...[125, 265, 400, 525].map((x, i) => ({ x, base: 266 - (i % 2) * 3, s: 1.1, layer: 2 as const })),
];

// titik koneksi tiap rumah (di atas atap)
const NODES = HOUSES.map((h) => ({ x: h.x, y: h.base - 50 * h.s - 10 }));

// hubungkan tiap rumah ke 2 tetangga terdekat, tanpa duplikat
const LINKS = (() => {
  const seen = new Set<string>();
  const out: [number, number][] = [];
  NODES.forEach((a, i) => {
    NODES.map((b, j) => ({ j, d: Math.hypot(a.x - b.x, (a.y - b.y) * 1.6) }))
      .filter((n) => n.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push([i, j]);
        }
      });
  });
  return out;
})();

function HouseShape({ h, i }: { h: House; i: number }) {
  const { x, base, s, layer } = h;
  const c = LAYER[layer];
  const w = 40 * s, wall = 30 * s, roof = 20 * s;
  return (
    <g opacity={c.opacity}>
      <path d={`M${x - w / 2} ${base} V${base - wall} L${x} ${base - wall - roof} L${x + w / 2} ${base - wall} V${base} Z`} fill={c.house} />
      <rect
        className={layer > 0 ? "village-window" : undefined}
        x={x - 4 * s} y={base - wall + 6 * s} width={8 * s} height={8 * s} rx={1.2 * s}
        fill={c.window} opacity={layer === 0 ? 0.5 : undefined}
        style={{ animationDelay: `${(i % 5) * 0.7}s` }}
      />
    </g>
  );
}

export default function VillageScene() {
  return (
    <svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 w-full h-[50%] pointer-events-none" aria-hidden>
      {/* Matahari */}
      <g className="village-sun">
        <circle cx="520" cy="70" r="46" fill="#bef264" opacity="0.15" />
        <circle cx="520" cy="70" r="28" fill="#d9f99d" opacity="0.5" />
      </g>

      {/* Bukit & rumah, dari belakang ke depan */}
      <path d="M0 200 Q90 168 190 196 T380 190 T600 186 V300 H0 Z" fill={LAYER[0].hill} opacity="0.7" />
      {HOUSES.map((h, i) => h.layer === 0 && <HouseShape key={i} h={h} i={i} />)}

      <path d="M0 232 Q110 204 230 228 T430 222 T600 218 V300 H0 Z" fill={LAYER[1].hill} />
      {HOUSES.map((h, i) => h.layer === 1 && <HouseShape key={i} h={h} i={i} />)}

      <path d="M0 262 Q130 240 270 258 T600 250 V300 H0 Z" fill={LAYER[2].hill} />
      {HOUSES.map((h, i) => h.layer === 2 && <HouseShape key={i} h={h} i={i} />)}

      {/* Pohon */}
      {[28, 198, 335, 470, 580].map((x, i) => (
        <g key={x} className="village-tree" style={{ animationDelay: `${i * 0.6}s` }}>
          <rect x={x - 1.5} y="266" width="3" height="14" fill="#04201b" />
          <circle cx={x} cy="261" r="10" fill="#0b6b52" />
          <circle cx={x - 6} cy="267" r="7" fill="#0b6b52" />
          <circle cx={x + 6} cy="267" r="7" fill="#0b6b52" />
        </g>
      ))}

      {/* Jaringan antar rumah */}
      <g stroke="#6ee7b7" strokeWidth="1" fill="none" opacity="0.45">
        {LINKS.map(([a, b]) => (
          <line key={`${a}-${b}`} className="village-link" x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} />
        ))}
      </g>
      {NODES.map((n, i) => (
        <g key={i}>
          {i % 3 === 0 && <circle className="village-node-ring" cx={n.x} cy={n.y} r="3" fill="#6ee7b7" style={{ animationDelay: `${(i % 7) * 0.4}s` }} />}
          <circle cx={n.x} cy={n.y} r={HOUSES[i].layer === 0 ? 2.2 : HOUSES[i].layer === 1 ? 2.8 : 3.4} fill="#a7f3d0" />
        </g>
      ))}

      <path d="M0 286 Q200 272 400 284 T600 278 V300 H0 Z" fill="#031812" />
    </svg>
  );
}
