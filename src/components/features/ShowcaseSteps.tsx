"use client";

import { useRef, type ReactNode } from "react";

// Generic step-card controller for feature showcases. Renders the step cards
// as buttons that seek every animation of a given class-prefix inside the
// section to a scene start time (Web Animations API). Mirrors the digital
// check-in controller but is parameterized so every showcase shares one
// interaction pattern. No-ops under prefers-reduced-motion.
export function ShowcaseSteps({
  cards,
  labels,
  sceneStartsMs,
  prefix,
}: {
  cards: ReactNode[];
  labels: string[];
  sceneStartsMs: number[];
  prefix: string;
}) {
  const listRef = useRef<HTMLOListElement>(null);

  const jumpTo = (scene: number) => {
    const section = listRef.current?.closest("section");
    if (!section) return;
    for (const animation of section.getAnimations({ subtree: true })) {
      if (animation instanceof CSSAnimation && animation.animationName.startsWith(prefix)) {
        animation.currentTime = sceneStartsMs[scene] ?? 0;
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
