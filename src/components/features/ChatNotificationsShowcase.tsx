import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { UsersIcon, SteeringWheelIcon, ChartIcon } from "@/components/icons";
import { featureRel } from "@/lib/features";
import { ShowcaseStage } from "./ShowcaseStage";
import { ChatPlayer } from "./ChatPlayer";
import { NotificationsScene } from "./NotificationsScene";
import { FeatureProblemSection } from "./FeatureProblemSection";
import { FeatureBenefitsSection } from "./FeatureBenefitsSection";
import { FeatureFAQSection } from "./FeatureFAQSection";

// Real-time Chat & Notifications (feature 3) rich showcase: dispatcher<->driver
// split scene + problem narrative + benefits by role + FAQ. Server Component.
export function ChatNotificationsShowcase({ t, locale }: { t: Translations; locale: Locale }) {
  const c = t.chatPage;
  return (
    <>
      <ShowcaseStage
        title={c.title}
        subtitle={c.subtitle}
        stepLabel={c.stepLabel}
        glowPrefix="ch-"
        sceneStartsMs={[]}
        aspectClass="aspect-[4/3] sm:aspect-[16/9]"
        minHClass="min-h-[360px]"
        headingId="chat-showcase-title"
      >
        <ChatPlayer t={t} locale={locale} />
      </ShowcaseStage>

      <ShowcaseStage
        title={c.notifTitle}
        subtitle={c.notifSubtitle}
        stepLabel={c.stepLabel}
        glowPrefix="nt-"
        sceneStartsMs={[]}
        aspectClass="aspect-[4/3] sm:aspect-[16/9]"
        minHClass="min-h-[440px]"
        headingId="notif-showcase-title"
      >
        <NotificationsScene t={t} />
      </ShowcaseStage>

      <FeatureProblemSection
        idPrefix="ch3"
        eyebrow={c.probEyebrow}
        title={c.probTitle}
        paragraphs={[c.probP1, c.probP2]}
        compare={{
          oldTitle: c.oldTitle,
          newTitle: c.newTitle,
          oldRows: [c.old1, c.old2, c.old3, c.old4],
          newRows: [c.new1, c.new2, c.new3, c.new4],
        }}
      />

      <FeatureBenefitsSection
        idPrefix="ch3"
        title={c.benTitle}
        subtitle={c.benSub}
        groups={[
          { icon: UsersIcon, title: c.b1t, items: [c.b1a, c.b1b, c.b1c] },
          { icon: SteeringWheelIcon, title: c.b2t, items: [c.b2a, c.b2b, c.b2c] },
          { icon: ChartIcon, title: c.b3t, items: [c.b3a, c.b3b, c.b3c] },
        ]}
      />

      <FeatureFAQSection
        idPrefix="ch3"
        title={c.faqTitle}
        items={[
          { q: c.q1, a: c.a1 },
          { q: c.q2, a: c.a2 },
          { q: c.q3, a: c.a3 },
          { q: c.q4, a: c.a4 },
        ]}
        locale={locale}
        path={featureRel(locale, 3)}
      />
    </>
  );
}
