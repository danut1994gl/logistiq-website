import type { ReactNode } from "react";

// The one logistiq.cloud mark, shared by every scene that needs it (f9 Cloud, the
// f15 gate-network diagram, the f16 integrations map) so the cloud is literally
// the same drawing everywhere. Centred on (0,0); callers place and scale it with a
// wrapping <g transform="translate(cx cy) scale(s)">.
//
// The cloud is a union of CIRCLES rather than one path so the outline stays round
// and continuous on every side (including the bottom). The official banner rides a
// white plate — but the plate now FADES to transparent on its left/right edges
// (id-namespaced gradient) so it melts into the blue cloud instead of reading as a
// hard white rectangle. The centre stays opaque, so the dark wordmark is legible.

export const CLOUD_LOBES = [
  { cx: -108, cy: 8, r: 50 },
  { cx: -48, cy: -30, r: 58 },
  { cx: 28, cy: -40, r: 66 },
  { cx: 104, cy: 4, r: 52 },
  { cx: 60, cy: 40, r: 46 },
  { cx: -8, cy: 46, r: 50 },
  { cx: -66, cy: 40, r: 44 },
];

// Sized from the asset's own viewBox (1162.5 x 187.5) so it is never squashed.
export const CLOUD_BANNER_W = 228;
export const CLOUD_BANNER_H = Math.round((CLOUD_BANNER_W * 187.5) / 1162.5);

// Half-extents of the cloud's fill (for callers that want to anchor edges/links).
export const CLOUD_HW = 158; // -108-50 .. 104+52 ≈ ±158
export const CLOUD_HH = 108;

export function LogistiqCloud({
  id,
  banner = true,
  extra,
}: {
  // Namespaces the gradients so multiple instances never collide.
  id: string;
  // The banner-on-plate; drop it when a scene wants the cloud shape only.
  banner?: boolean;
  // Optional content placed inside the cloud, below the banner (e.g. a chip).
  extra?: ReactNode;
}) {
  const bw = CLOUD_BANNER_W;
  const bh = CLOUD_BANNER_H;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-cloudfill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        {/* opaque in the middle, transparent at the two ends → soft side edges */}
        <linearGradient id={`${id}-plate`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="16%" stopColor="#fff" stopOpacity="0.96" />
          <stop offset="84%" stopColor="#fff" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* outline: the same lobes, slightly larger, behind the fill */}
      <g fill="#60a5fa">
        {CLOUD_LOBES.map((l, i) => (
          <circle key={i} cx={l.cx} cy={l.cy} r={l.r + 2} />
        ))}
      </g>
      <g fill={`url(#${id}-cloudfill)`}>
        {CLOUD_LOBES.map((l, i) => (
          <circle key={i} cx={l.cx} cy={l.cy} r={l.r} />
        ))}
      </g>

      {banner && (
        <>
          <rect x={-bw / 2 - 13} y={-bh / 2 - 11} width={bw + 26} height={bh + 22} rx={12} fill={`url(#${id}-plate)`} />
          <image
            href="/logistiq-banner-dark.svg"
            x={-bw / 2}
            y={-bh / 2}
            width={bw}
            height={bh}
            preserveAspectRatio="xMidYMid meet"
          />
        </>
      )}
      {extra}
    </g>
  );
}
