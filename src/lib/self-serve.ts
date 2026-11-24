/**
 * Master switch for the self-serve go-to-market surface. On this site: the plans
 * section (no prices; its buttons lead to the contact form, and no signup link is
 * left since 2026-11-24) and the Pricing links to it. On logistiq.cloud the
 * same-named variable gates signup, which also needs card payments on (Logistiq
 * ADR-057).
 * Fail-closed: ON only when the env value is exactly 'true'. See ADR-005. Flip
 * NEXT_PUBLIC_SELF_SERVE_ENABLED in Vercel to re-enable; no code change required.
 *
 * ⚠️ Build-time flag: NEXT_PUBLIC_* is inlined at compile time, so changing the
 * value in Vercel requires a REDEPLOY (a fresh build) to take effect — updating the
 * env var alone does nothing, and a zero-diff commit won't trigger a rebuild.
 */
export function isSelfServeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED === 'true'
}
