import { describe, it, expect } from 'vitest';
import {
  LEGACY_SOCIAL_TOKENS_KEY,
  SOCIAL_PREFERENCES_KEY,
  applySocialPreferenceUpdates,
  loadSocialPreferences,
  pickSocialPreferences,
  saveSocialPreferences,
  type PreferencesStorage,
} from './social-preferences-storage';

const makeStorage = (initial: Record<string, string> = {}) => {
  const data = new Map<string, string>(Object.entries(initial));
  const storage: PreferencesStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
  return { storage, data };
};

// Placeholder values shaped like what the earlier build persisted. None of these is a real credential.
const LEGACY_RECORD = {
  redditClientId: 'client-id-value',
  redditClientSecret: 'client-secret-value',
  redditUsername: 'username-value',
  redditPassword: 'password-value',
  twitterBearerToken: 'bearer-value',
  ayrshareApiKey: 'ayrshare-value',
  webhookUrl: 'https://hooks.example.test/services/webhook-value',
  autoPostEnabled: true,
  autoPostThreshold: 85,
  includeFunnelPreviewLink: false,
};

const SECRET_VALUES = [
  'client-id-value',
  'client-secret-value',
  'username-value',
  'password-value',
  'bearer-value',
  'ayrshare-value',
  'webhook-value',
];

const everythingStored = (data: Map<string, string>): string => [...data.entries()].flat().join('\n');

describe('loadSocialPreferences: legacy token record', () => {
  it('deletes the legacy record and carries only the funnel-link preference forward', () => {
    const { storage, data } = makeStorage({ [LEGACY_SOCIAL_TOKENS_KEY]: JSON.stringify(LEGACY_RECORD) });

    const preferences = loadSocialPreferences(storage);

    expect(preferences).toEqual({ includeFunnelPreviewLink: false });
    expect(data.has(LEGACY_SOCIAL_TOKENS_KEY)).toBe(false);
    expect(JSON.parse(data.get(SOCIAL_PREFERENCES_KEY) as string)).toEqual({ includeFunnelPreviewLink: false });
  });

  it('leaves no secret value, secret field name or removed auto-post field in storage', () => {
    const { storage, data } = makeStorage({ [LEGACY_SOCIAL_TOKENS_KEY]: JSON.stringify(LEGACY_RECORD) });

    loadSocialPreferences(storage);

    const stored = everythingStored(data);
    for (const value of SECRET_VALUES) {
      expect(stored).not.toContain(value);
    }
    for (const field of Object.keys(LEGACY_RECORD).filter((name) => name !== 'includeFunnelPreviewLink')) {
      expect(stored).not.toContain(field);
    }
  });

  it('deletes a corrupt legacy record and falls back to the defaults', () => {
    const { storage, data } = makeStorage({ [LEGACY_SOCIAL_TOKENS_KEY]: '{"redditPassword":"password-value"' });

    const preferences = loadSocialPreferences(storage);

    expect(preferences).toEqual({ includeFunnelPreviewLink: true });
    expect(data.has(LEGACY_SOCIAL_TOKENS_KEY)).toBe(false);
    expect(everythingStored(data)).not.toContain('password-value');
  });

  it('ignores a legacy funnel-link value that is not a boolean', () => {
    const { storage } = makeStorage({
      [LEGACY_SOCIAL_TOKENS_KEY]: JSON.stringify({ includeFunnelPreviewLink: 'no', redditPassword: 'password-value' }),
    });

    expect(loadSocialPreferences(storage)).toEqual({ includeFunnelPreviewLink: true });
  });

  it('prefers a preference already saved under the new key over the legacy one', () => {
    const { storage } = makeStorage({
      [LEGACY_SOCIAL_TOKENS_KEY]: JSON.stringify({ includeFunnelPreviewLink: false }),
      [SOCIAL_PREFERENCES_KEY]: JSON.stringify({ includeFunnelPreviewLink: true }),
    });

    expect(loadSocialPreferences(storage)).toEqual({ includeFunnelPreviewLink: true });
  });
});

describe('loadSocialPreferences: no legacy record', () => {
  it('returns the defaults and writes nothing on a first visit', () => {
    const { storage, data } = makeStorage();

    expect(loadSocialPreferences(storage)).toEqual({ includeFunnelPreviewLink: true });
    expect(data.size).toBe(0);
  });

  it('reads a saved preference back', () => {
    const { storage } = makeStorage({ [SOCIAL_PREFERENCES_KEY]: JSON.stringify({ includeFunnelPreviewLink: false }) });

    expect(loadSocialPreferences(storage)).toEqual({ includeFunnelPreviewLink: false });
  });

  it('drops unknown fields found under the new key', () => {
    const { storage } = makeStorage({
      [SOCIAL_PREFERENCES_KEY]: JSON.stringify({ includeFunnelPreviewLink: false, webhookUrl: 'https://hooks.example.test/x' }),
    });

    expect(loadSocialPreferences(storage)).toEqual({ includeFunnelPreviewLink: false });
  });

  it('returns the defaults when there is no storage', () => {
    expect(loadSocialPreferences(null)).toEqual({ includeFunnelPreviewLink: true });
  });

  it('returns the defaults, without throwing, when storage refuses every call', () => {
    const blocked: PreferencesStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };

    expect(loadSocialPreferences(blocked)).toEqual({ includeFunnelPreviewLink: true });
  });
});

describe('saveSocialPreferences', () => {
  it('writes only the known preference even when handed extra fields', () => {
    const { storage, data } = makeStorage();
    const withExtras = { includeFunnelPreviewLink: false, redditPassword: 'password-value' };

    saveSocialPreferences(storage, withExtras);

    expect(JSON.parse(data.get(SOCIAL_PREFERENCES_KEY) as string)).toEqual({ includeFunnelPreviewLink: false });
    expect(everythingStored(data)).not.toContain('password-value');
  });

  it('does nothing without storage', () => {
    expect(() => saveSocialPreferences(null, { includeFunnelPreviewLink: true })).not.toThrow();
  });
});

describe('pickSocialPreferences', () => {
  it.each([null, undefined, 'text', 7, [], [true]])('returns nothing for %j', (value) => {
    expect(pickSocialPreferences(value)).toEqual({});
  });
});

describe('guidePageUrl preference', () => {
  const GUIDE_PAGE = 'https://guide.example.org/annuity-guide/';

  it('keeps a valid address, trimmed, alongside the funnel-link preference', () => {
    const picked = pickSocialPreferences({ includeFunnelPreviewLink: true, guidePageUrl: `  ${GUIDE_PAGE} ` });

    expect(picked).toEqual({ includeFunnelPreviewLink: true, guidePageUrl: GUIDE_PAGE });
  });

  it.each(['', '   ', 'guide.example.org', '/annuity-guide/', 'javascript:alert(1)', 7, null, true])(
    'drops the invalid value %j',
    (value) => {
      expect(pickSocialPreferences({ guidePageUrl: value })).toEqual({});
    },
  );

  it('saves and loads the address', () => {
    const { storage, data } = makeStorage();

    saveSocialPreferences(storage, { includeFunnelPreviewLink: false, guidePageUrl: GUIDE_PAGE });

    expect(JSON.parse(data.get(SOCIAL_PREFERENCES_KEY) as string)).toEqual({
      includeFunnelPreviewLink: false,
      guidePageUrl: GUIDE_PAGE,
    });
    expect(loadSocialPreferences(storage)).toEqual({ includeFunnelPreviewLink: false, guidePageUrl: GUIDE_PAGE });
  });

  it('is absent from the defaults, so a first visit holds only the funnel-link preference', () => {
    expect(loadSocialPreferences(makeStorage().storage)).not.toHaveProperty('guidePageUrl');
  });
});

describe('applySocialPreferenceUpdates', () => {
  const GUIDE_PAGE = 'https://guide.example.org/annuity-guide/';
  const current = { includeFunnelPreviewLink: true };

  it('merges an update over the current preferences', () => {
    expect(applySocialPreferenceUpdates(current, { includeFunnelPreviewLink: false })).toEqual({
      includeFunnelPreviewLink: false,
    });
  });

  it('stores a normalized guide page URL', () => {
    expect(applySocialPreferenceUpdates(current, { guidePageUrl: ` ${GUIDE_PAGE}` })).toEqual({
      includeFunnelPreviewLink: true,
      guidePageUrl: GUIDE_PAGE,
    });
  });

  it('keeps the guide page URL when only another preference changes', () => {
    const withGuide = { includeFunnelPreviewLink: true, guidePageUrl: GUIDE_PAGE };

    expect(applySocialPreferenceUpdates(withGuide, { includeFunnelPreviewLink: false })).toEqual({
      includeFunnelPreviewLink: false,
      guidePageUrl: GUIDE_PAGE,
    });
  });

  it.each(['', '  ', 'not a url'])('clears the guide page URL when it is updated to "%s"', (value) => {
    const withGuide = { includeFunnelPreviewLink: true, guidePageUrl: GUIDE_PAGE };

    const next = applySocialPreferenceUpdates(withGuide, { guidePageUrl: value });

    expect(next).toEqual({ includeFunnelPreviewLink: true });
    expect(next).not.toHaveProperty('guidePageUrl');
  });

  it('does not change the object it was given', () => {
    const withGuide = { includeFunnelPreviewLink: true, guidePageUrl: GUIDE_PAGE };

    applySocialPreferenceUpdates(withGuide, { guidePageUrl: '' });

    expect(withGuide.guidePageUrl).toBe(GUIDE_PAGE);
  });
});
