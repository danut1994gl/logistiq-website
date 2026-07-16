/**
 * Master switch for the self-serve go-to-market surface (public signup + public
 * pricing + Stripe self-checkout). Fail-closed: ON only when the env value is
 * exactly 'true'. See ADR-005. Flip NEXT_PUBLIC_SELF_SERVE_ENABLED in Vercel to
 * re-enable; no code change required.
 *
 * ⚠️ Build-time flag: NEXT_PUBLIC_* is inlined at compile time, so changing the
 * value in Vercel requires a REDEPLOY (a fresh build) to take effect — updating the
 * env var alone does nothing, and a zero-diff commit won't trigger a rebuild.
 */
export function isSelfServeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED === 'true'
}
