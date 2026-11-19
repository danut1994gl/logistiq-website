import { createReadClient } from "@/lib/supabase";

// The contact form's lead row, written through submit_website_lead: a database function (Logistiq monorepo,
// migration 330) that refuses unless it is given CONTACT_LEAD_KEY, a key only this site's server holds; the database
// keeps nothing but its SHA-256. It then stores at most 30 leads in a clock hour, bounds every field as FIELD_MAX
// does, and sets the row's source, status and dates itself. Until migration 331 the leads table also took an insert
// from anyone holding the public anon key, past every anti-spam layer of the route; 331 closes that.
//
// Server-only: the contact route (app/api/contact/route.ts) is this module's only importer (lead.test.ts checks it),
// and CONTACT_LEAD_KEY is a server variable (never NEXT_PUBLIC_), set on the site's Vercel project for Production
// alone. Previews and local builds have no key, and their lead step is logged as failed.

/** A person's lead as the route checked it: trimmed, within FIELD_MAX; an empty company is "". */
export interface Lead {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

/**
 * Stores the lead through submit_website_lead with the anon key and CONTACT_LEAD_KEY.
 *
 * The client is built first, so a server without Supabase's URL says so before anything else, then the key is read:
 * either missing throws. The function's own refusal (42501 for a key it does not know, P0001 past the hourly limit,
 * 22023 for a field over its bound) comes back as `error`, for the route to log; its messages never carry the key.
 */
export async function storeLead(lead: Lead): Promise<{ error: unknown }> {
  const supabase = createReadClient();
  const key = process.env.CONTACT_LEAD_KEY;
  if (!key) throw new Error("Missing CONTACT_LEAD_KEY");
  const { error } = await supabase.rpc("submit_website_lead", {
    p_key: key,
    p_name: lead.name,
    p_email: lead.email,
    p_phone: lead.phone,
    p_company: lead.company || null,
    p_message: lead.message,
  });
  return { error };
}
