/**
 * The local user behind "Launch Instant Demo Sandbox".
 *
 * The sandbox is client-side only: the plugin has no signup or demo route, so
 * no server account backs it. It therefore carries no password and no email
 * address. Plan limits are passed in so this module stays pure (importable by
 * vitest without the Svelte rune store).
 */
import type { AuthUser, PlanLimits, SaasPlanTier } from '../stores/auth-store.svelte';

export const DEMO_SESSION_PLAN: SaasPlanTier = 'pro';

export function buildDemoSessionUser(planLimits: PlanLimits, nowMs: number): AuthUser {
  return {
    id: `demo-${nowMs}`,
    username: 'Demo Hunter',
    email: '',
    fullName: 'Demo Hunter',
    role: 'user',
    roles: ['saas_member'],
    plan: DEMO_SESSION_PLAN,
    planLimits,
    registeredAt: Math.floor(nowMs / 1000),
  };
}
