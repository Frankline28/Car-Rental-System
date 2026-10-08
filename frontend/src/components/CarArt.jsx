// Side-view car illustrations drawn in SVG, so the app needs no image files.
const SHAPES = {
  Sedan: {
    body: 'M10 70 L10 58 Q10 52 18 50 L52 44 Q70 22 100 20 L150 20 Q176 22 192 44 L224 50 Q232 52 232 60 L232 70 Z',
    win: ['M68 44 Q80 28 100 27 L118 27 L118 44 Z', 'M124 27 L150 27 Q166 29 178 44 L124 44 Z'],
    wheels: [58, 184],
  },
  SUV: {
    body: 'M10 72 L10 52 Q10 46 18 44 L44 40 L62 18 L196 18 Q206 18 210 28 L224 44 Q232 48 232 56 L232 72 Z',
    win: ['M68 38 L78 25 L116 25 L116 38 Z', 'M122 25 L190 25 L200 38 L122 38 Z'],
    wheels: [58, 184],
  },
  Hatchback: {
    body: 'M10 72 L10 58 Q10 52 18 50 L48 46 Q64 22 92 20 L170 20 Q196 22 206 46 L226 52 Q232 54 232 62 L232 72 Z',
    win: ['M62 45 Q72 28 94 26 L120 26 L120 45 Z', 'M126 26 L168 26 Q184 28 194 45 L126 45 Z'],
    wheels: [56, 182],
  },
  MPV: {
    body: 'M10 72 L10 50 Q10 44 18 42 L40 38 Q52 20 70 18 L200 18 Q212 18 216 30 L228 46 Q234 50 234 58 L234 72 Z',
    win: ['M60 38 Q68 26 76 25 L112 25 L112 38 Z', 'M118 25 L150 25 L150 38 L118 38 Z', 'M156 25 L198 25 L206 38 L156 38 Z'],
    wheels: [58, 186],
  },
  Luxury: {
    body: 'M8 70 L8 60 Q8 54 16 52 L56 46 Q80 26 112 24 L148 24 Q176 26 196 46 L228 52 Q236 54 236 62 L236 70 Z',
    win: ['M72 45 Q90 32 112 31 L124 31 L124 45 Z', 'M130 31 L148 31 Q168 33 184 45 L130 45 Z'],
    wheels: [60, 184],
  },
};

export default function CarArt({ type = 'Sedan', color = '#0B6B5F', className = '', title }) {
  const s = SHAPES[type] || SHAPES.Sedan;
  return (
    <svg viewBox="0 0 244 100" className={className} role="img" aria-label={title || `${type} car`}>
      <ellipse cx="122" cy="90" rx="108" ry="5" fill="rgba(0,0,0,.14)" />
      <path d={s.body} fill={color} />
      {s.win.map((d, i) => (
        <path key={i} d={d} fill="#DCE9EC" opacity=".92" />
      ))}
      <rect x="224" y="56" width="9" height="5" rx="2" fill="#F0B429" />
      {s.wheels.map((x) => (
        <g key={x}>
          <circle cx={x} cy="72" r="14" fill="#1E2227" />
          <circle cx={x} cy="72" r="6" fill="#C9CEC8" />
        </g>
      ))}
    </svg>
  );
}
