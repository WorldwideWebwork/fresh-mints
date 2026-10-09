import { describe, it, expect } from 'vitest';
import { DEMO_SESSION_PLAN, buildDemoSessionUser } from './demo-session';

const PRO_LIMITS = { maxRules: 20, scansPerDay: 500, maxCrmLeads: 2500 };
const NOW_MS = 1_791_500_000_123;

describe('buildDemoSessionUser', () => {
  it('starts the sandbox on the pro plan with the limits it is given', () => {
    const user = buildDemoSessionUser(PRO_LIMITS, NOW_MS);
    expect(DEMO_SESSION_PLAN).toBe('pro');
    expect(user.plan).toBe(DEMO_SESSION_PLAN);
    expect(user.planLimits).toBe(PRO_LIMITS);
  });

  it('carries no email address, since no real mailbox backs the sandbox', () => {
    expect(buildDemoSessionUser(PRO_LIMITS, NOW_MS).email).toBe('');
  });

  it('marks the session as a demo through its id and never grants admin', () => {
    const user = buildDemoSessionUser(PRO_LIMITS, NOW_MS);
    expect(user.id).toBe(`demo-${NOW_MS}`);
    expect(user.role).not.toBe('admin');
    expect(user.roles).not.toContain('administrator');
  });

  it('records the registration time in whole seconds', () => {
    expect(buildDemoSessionUser(PRO_LIMITS, NOW_MS).registeredAt).toBe(1_791_500_000);
  });
});
