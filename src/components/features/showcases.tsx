import type { FC } from "react";
import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { DigitalCheckinShowcase } from "./DigitalCheckinShowcase";
import { DockManagementShowcase } from "./DockManagementShowcase";
import { ChatNotificationsShowcase } from "./ChatNotificationsShowcase";
import { YardManagementShowcase } from "./YardManagementShowcase";
import { ReportsAnalyticsShowcase } from "./ReportsAnalyticsShowcase";
import { CategoryRoutingShowcase } from "./CategoryRoutingShowcase";
import { MobileAppShowcase } from "./MobileAppShowcase";
import { MultiLanguageShowcase } from "./MultiLanguageShowcase";
import { WhiteLabelShowcase } from "./WhiteLabelShowcase";
import { CloudShowcase } from "./CloudShowcase";
import { InstructionsShowcase } from "./InstructionsShowcase";
import { SchedulingShowcase } from "./SchedulingShowcase";
import { GeofenceShowcase } from "./GeofenceShowcase";
import { SelfCheckShowcase } from "./SelfCheckShowcase";

// Per-feature showcase slot: feature id -> rich content rendered under the
// hero on that feature's page (animation, narrative, benefits, FAQ — each
// feature composes its own). Kept out of lib/features.ts so the data
// registry stays free of component imports.
export const featureShowcases: Partial<Record<number, FC<{ t: Translations; locale: Locale }>>> = {
  1: DigitalCheckinShowcase,
  2: DockManagementShowcase,
  3: ChatNotificationsShowcase,
  4: CategoryRoutingShowcase,
  5: ReportsAnalyticsShowcase,
  6: MobileAppShowcase,
  7: MultiLanguageShowcase,
  8: WhiteLabelShowcase,
  9: CloudShowcase,
  10: InstructionsShowcase,
  11: SchedulingShowcase,
  12: GeofenceShowcase,
  13: YardManagementShowcase,
  14: SelfCheckShowcase,
};
