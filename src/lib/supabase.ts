import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Anon-only read client for the marketing website. RLS on the blog tables returns
// PUBLISHED rows only, so this key is safe to hold — but it is still read server-side.
// NEVER put the service-role key here (the website must not be able to bypass RLS).
// Its one write is the contact form's lead, only through submit_website_lead with
// CONTACT_LEAD_KEY (lib/contact/lead.ts), never into a table.
let cached: SupabaseClient | null = null;

export function createReadClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  cached = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
