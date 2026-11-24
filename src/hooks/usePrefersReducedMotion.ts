import { useSyncExternalStore } from "react";

// prefers-reduced-motion, read as an external store (as GeofenceScene and InstructionsScene
// do) instead of being pushed into state from an effect: a scene derives its static frame
// during render, with no cascading render (react-hooks/set-state-in-effect). The server
// snapshot is false, so the prerendered markup and the first client render are the animated
// scene's, and hydration stays consistent (CLAUDE.md, golden rule 6); a visitor who asks
// for reduced motion gets the static frame on the render right after.
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
