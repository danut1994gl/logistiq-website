import { describe, it, expect, vi, beforeEach } from "vitest";

const revalidateTag = vi.fn();
const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidateTag: (...a: unknown[]) => revalidateTag(...a),
  revalidatePath: (...a: unknown[]) => revalidatePath(...a),
}));

import { POST } from "@/app/api/revalidate/route";

function req(secret: string | null, body: unknown): Request {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (secret !== null) headers["x-revalidate-secret"] = secret;
  return new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    revalidateTag.mockClear();
    revalidatePath.mockClear();
    vi.stubEnv("REVALIDATE_SECRET", "s3cret");
  });

  it("401 when the secret header is missing", async () => {
    const res = await POST(req(null, { event: "publish", id: "1", slugs: {} }) as never);
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("401 when the secret mismatches", async () => {
    const res = await POST(req("wrong", { event: "publish", id: "1", slugs: {} }) as never);
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("401 (fail-closed) when REVALIDATE_SECRET is unset", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "");
    const res = await POST(req("anything", { event: "publish", id: "1", slugs: {} }) as never);
    expect(res.status).toBe(401);
  });

  it("busts tag + per-locale paths + sitemap + rss on a valid call", async () => {
    const res = await POST(
      req("s3cret", { event: "update", id: "abc", slugs: { ro: "ghid-ro", en: "guide-en" } }) as never
    );
    expect(res.status).toBe(200);
    // Next 16 requires the second cacheLife profile arg ("max").
    expect(revalidateTag).toHaveBeenCalledWith("blog", "max");
    expect(revalidatePath).toHaveBeenCalledWith("/ro/blog");
    expect(revalidatePath).toHaveBeenCalledWith("/ro/blog/ghid-ro");
    expect(revalidatePath).toHaveBeenCalledWith("/en/blog");
    expect(revalidatePath).toHaveBeenCalledWith("/en/blog/guide-en");
    expect(revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
    expect(revalidatePath).toHaveBeenCalledWith("/rss.xml");
  });
});
