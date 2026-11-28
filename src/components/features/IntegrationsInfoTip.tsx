"use client";

import { useEffect, useId, useRef, useState } from "react";

// The info button on a card of the integrations map, and the note it opens: what that
// part of Logistiq (or of the warehouse's own systems) does. A click or a tap opens and
// closes it, a mouse opens it on hover, and Escape or a click elsewhere closes it. Styled
// as the map's own cards: the card fill and border, the blue of the spokes. Closed on the
// first render, so the server's HTML and the browser's first paint agree.

export type TipSide = "right" | "left" | "below" | "above";

const PLACE: Record<TipSide, string> = {
  right: "left-full top-1/2 -translate-y-1/2 ml-2.5",
  left: "right-full top-1/2 -translate-y-1/2 mr-2.5",
  below: "top-full left-1/2 -translate-x-1/2 mt-2.5",
  above: "bottom-full left-1/2 -translate-x-1/2 mb-2.5",
};

export function IntegrationsInfoTip({
  name,
  text,
  what,
  side,
}: {
  /** the card's name, as its label shows it */
  name: string;
  /** what it does */
  text: string;
  /** "what it does", for the button's accessible name */
  what: string;
  side: TipSide;
}) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const id = useId();
  const shown = open || hover;

  useEffect(() => {
    if (!shown) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setHover(false);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [shown]);

  return (
    <span
      ref={root}
      className={`relative flex -translate-x-1/2 -translate-y-1/2 ${shown ? "z-30" : "z-10"}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
    >
      <button
        type="button"
        aria-label={`${name}: ${what}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-[clamp(1.125rem,2.2cqw,1.625rem)] w-[clamp(1.125rem,2.2cqw,1.625rem)] items-center justify-center rounded-full border shadow-md shadow-black/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7dd3fc] ${
          shown
            ? "border-[#3b82f6] bg-[#3b82f6] text-white"
            : "border-[#3b82f6]/70 bg-[#1b2532] text-[#7dd3fc] hover:border-[#3b82f6] hover:bg-[#243040]"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-[62%] w-[62%]" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" aria-hidden="true">
          <path d="M12 11v6" />
          <circle cx="12" cy="7" r="0.6" fill="currentColor" strokeWidth={2.2} />
        </svg>
      </button>
      <span
        id={id}
        role="tooltip"
        hidden={!shown}
        className={`absolute ${PLACE[side]} w-64 max-w-[62cqw] rounded-[10px] border border-[#334155] bg-[#1b2532]/95 px-3.5 py-3 text-left shadow-xl shadow-black/50 backdrop-blur-sm`}
      >
        <span className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-[#e2e8f0]">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#22c55e]" aria-hidden="true" />
          {name}
        </span>
        <span className="block text-[12.5px] leading-snug text-[#cbd5e1]">{text}</span>
      </span>
    </span>
  );
}
