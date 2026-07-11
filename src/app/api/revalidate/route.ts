import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export const runtime = "nodejs";

// On-demand cache busting from the dashboard on publish/update/unpublish/delete.
// Fail-closed: 401 unless REVALIDATE_SECRET is set AND the header matches exactly.
// Body (from Part 2): { event, id, slugs: { [locale]: slug } } — includes OLD slugs
// on rename/unpublish/delete so stale localized paths are swept too.
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const provided = request.headers.get("x-revalidate-secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { event?: string; id?: string; slugs?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const slugs = body.slugs ?? {};

  // Next 16 requires the cacheLife profile arg; "max" is the documented migration
  // of the legacy single-arg revalidateTag on-demand purge (see next.js deprecation
  // notice). Busts every unstable_cache entry tagged "blog".
  revalidateTag("blog", "max");
  for (const [loc, slug] of Object.entries(slugs)) {
    revalidatePath(`/${loc}/blog`);
    if (slug) revalidatePath(`/${loc}/blog/${slug}`);
  }
  revalidatePath("/sitemap.xml");
  revalidatePath("/rss.xml");

  return NextResponse.json({
    revalidated: true,
    event: body.event ?? null,
    id: body.id ?? null,
  });
}
