/**
 * Browser-side Social Radar preferences. This holds display choices only.
 *
 * Credentials (API keys, tokens, webhook URLs) are never kept in the browser: they live in the
 * WordPress Connectors API and are used only by the Fresh Mints server routes. An earlier build
 * stored them under LEGACY_SOCIAL_TOKENS_KEY, so loading purges that record on sight.
 */

import { normalizeGuidePageUrl } from '../services/social-feed/funnel-link';

export interface SocialPreferences {
  includeFunnelPreviewLink: boolean;
  /**
   * Public capture page that attributed reply links point at (the annuity guide). A page address,
   * not a credential. Absent until the owner sets one.
   */
  guidePageUrl?: string;
}

export const SOCIAL_PREFERENCES_KEY = 'fresh_mints_social_preferences';
export const LEGACY_SOCIAL_TOKENS_KEY = 'fresh_mints_social_tokens';

export const DEFAULT_SOCIAL_PREFERENCES: Readonly<SocialPreferences> = {
  includeFunnelPreviewLink: true,
};

export type PreferencesStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const parseJson = (raw: string | null): unknown => {
  const hasRaw = raw !== null;
  if (!hasRaw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * Keeps only the known preferences, each type-checked. Any other field, such as a credential
 * left by the earlier build, is dropped here and so can never be copied forward.
 */
export const pickSocialPreferences = (value: unknown): Partial<SocialPreferences> => {
  const isRecord = typeof value === 'object' && value !== null && !Array.isArray(value);
  if (!isRecord) {
    return {};
  }
  const record = value as Record<string, unknown>;
  const includeLink = record.includeFunnelPreviewLink;
  const guidePageUrl = normalizeGuidePageUrl(record.guidePageUrl);
  return {
    ...(typeof includeLink === 'boolean' && { includeFunnelPreviewLink: includeLink }),
    ...(guidePageUrl !== '' && { guidePageUrl }),
  };
};

/** Merges an update into the current preferences. A blank or non-http(s) guide page URL clears it. */
export const applySocialPreferenceUpdates = (
  current: SocialPreferences,
  updates: Partial<SocialPreferences>,
): SocialPreferences => {
  const { guidePageUrl, ...withoutGuide } = { ...current, ...updates };
  const normalizedGuide = normalizeGuidePageUrl(guidePageUrl);
  return normalizedGuide === '' ? withoutGuide : { ...withoutGuide, guidePageUrl: normalizedGuide };
};

const readItem = (storage: PreferencesStorage, key: string): string | null => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const removeItem = (storage: PreferencesStorage, key: string): void => {
  try {
    storage.removeItem(key);
  } catch {
    // chemx-allow: best-effort storage is blocked, so there is nothing further this code can remove
  }
};

export const saveSocialPreferences = (
  storage: PreferencesStorage | null,
  preferences: SocialPreferences,
): void => {
  const isStorageUnavailable = storage === null;
  if (isStorageUnavailable) {
    return;
  }
  try {
    storage.setItem(SOCIAL_PREFERENCES_KEY, JSON.stringify(pickSocialPreferences(preferences)));
  } catch {
    // chemx-allow: best-effort storage is full or blocked, so the preference stays in memory for this session
  }
};

/**
 * Loads the preferences. The legacy token record is deleted first and in every case (valid,
 * corrupt or empty), then its non-secret preference, when it had one, moves to the new key.
 */
export const loadSocialPreferences = (storage: PreferencesStorage | null): SocialPreferences => {
  const isStorageUnavailable = storage === null;
  if (isStorageUnavailable) {
    return { ...DEFAULT_SOCIAL_PREFERENCES };
  }

  const legacyRaw = readItem(storage, LEGACY_SOCIAL_TOKENS_KEY);
  const hadLegacyRecord = legacyRaw !== null;
  const carriedOver = hadLegacyRecord ? pickSocialPreferences(parseJson(legacyRaw)) : {};
  if (hadLegacyRecord) {
    removeItem(storage, LEGACY_SOCIAL_TOKENS_KEY);
  }

  const current = pickSocialPreferences(parseJson(readItem(storage, SOCIAL_PREFERENCES_KEY)));
  const preferences: SocialPreferences = { ...DEFAULT_SOCIAL_PREFERENCES, ...carriedOver, ...current };

  if (hadLegacyRecord) {
    saveSocialPreferences(storage, preferences);
  }
  return preferences;
};
