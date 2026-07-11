import { describe, it, expect, beforeAll } from "vitest";
import { createReadClient } from "@/lib/supabase";

describe("createReadClient", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-test-key";
  });

  it("returns a usable read client", () => {
    const client = createReadClient();
    expect(typeof client.from).toBe("function");
  });

  it("memoizes the client instance", () => {
    expect(createReadClient()).toBe(createReadClient());
  });
});
