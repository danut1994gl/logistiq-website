import type { FC } from "react";
import type { Translations } from "@/lib/i18n/translations";
import { CheckinJourneySection } from "./CheckinJourneySection";

// Per-feature showcase slot: feature id -> rich section rendered under the
// hero on that feature's page. Kept out of lib/features.ts so the data
// registry stays free of component imports.
export const featureShowcases: Record<number, FC<{ t: Translations }>> = {
  1: CheckinJourneySection,
};
