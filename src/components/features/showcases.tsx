import type { FC } from "react";
import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { DigitalCheckinShowcase } from "./DigitalCheckinShowcase";
import { DockManagementShowcase } from "./DockManagementShowcase";
import { ChatNotificationsShowcase } from "./ChatNotificationsShowcase";
import { YardManagementShowcase } from "./YardManagementShowcase";

// Per-feature showcase slot: feature id -> rich content rendered under the
// hero on that feature's page (animation, narrative, benefits, FAQ — each
// feature composes its own). Kept out of lib/features.ts so the data
// registry stays free of component imports.
export const featureShowcases: Partial<Record<number, FC<{ t: Translations; locale: Locale }>>> = {
  1: DigitalCheckinShowcase,
  2: DockManagementShowcase,
  3: ChatNotificationsShowcase,
  13: YardManagementShowcase,
};
