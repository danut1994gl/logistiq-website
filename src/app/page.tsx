import { redirect } from "next/navigation";
import { siteForHost } from "@/lib/i18n/sites";

// Fallback only: middleware.ts answers "/" itself (the saved language, else the
// domain's first-visit language). This page is rendered once for every host, so
// it can only send to the default site's first-visit language (Romanian).
export default function RootPage() {
  redirect(`/${siteForHost(null).defaultLocale}`);
}
