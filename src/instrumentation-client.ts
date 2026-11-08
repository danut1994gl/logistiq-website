// Runs in the browser before the app hydrates (Next 15.3+).
//
// Vercel BotID at the basic level, free on every plan (Hobby included): the
// browser solves an invisible challenge and attaches it to the requests listed
// here; app/api/contact verifies it with checkBotId() at the same level (the two
// must match). Only the contact form's POST is protected, and the challenge
// script loads only when that POST is sent, never on a page view.
import { initBotId } from "botid/client/core";

initBotId({
  protect: [{ path: "/api/contact", method: "POST", advancedOptions: { checkLevel: "basic" } }],
});
