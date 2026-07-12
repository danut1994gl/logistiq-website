"use client";

import { useRef, type ReactNode } from "react";

// Scene start times on the shared 27s cj2 timeline (ms).
const SCENE_STARTS_MS = [0, 9000, 19000];

// The feature's only client code: renders the step cards as buttons and, on
// click, seeks every cj2 animation inside the section to that scene's start
// via the Web Animations API. All cj2 animations share one 27s duration with
// no animation-delay, so a uniform currentTime keeps scene, phone overlay and
// card glows in sync. No-ops under prefers-reduced-motion (nothing to seek).
export function CheckinJourneyController({ cards, labels }: { cards: ReactNode[]; labels: string[] }) {
  const listRef = useRef<HTMLOListElement>(null);

  const jumpTo = (scene: number) => {
    const section = listRef.current?.closest("section");
    if (!section) return;
    for (const animation of section.getAnimations({ subtree: true })) {
      // Seek only the shared cj2 timeline — never transitions or future
      // entrance/hover animations someone adds inside the section.
      if (animation instanceof CSSAnimation && animation.animationName.startsWith("cj2-")) {
        animation.currentTime = SCENE_STARTS_MS[scene];
      }
    }
  };

  return (
    <ol role="list" ref={listRef} className="grid gap-6 sm:grid-cols-3 mt-10 list-none">
      {cards.map((card, i) => (
        <li key={i} className="relative">
          <button
            type="button"
            aria-label={labels[i]}
            onClick={() => jumpTo(i)}
            className="block w-full h-full text-left cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
          >
            {card}
          </button>
        </li>
      ))}
    </ol>
  );
}
