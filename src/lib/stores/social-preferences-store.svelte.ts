import {
  DEFAULT_SOCIAL_PREFERENCES,
  applySocialPreferenceUpdates,
  loadSocialPreferences,
  saveSocialPreferences,
  type PreferencesStorage,
  type SocialPreferences,
} from './social-preferences-storage';

const resolveStorage = (): PreferencesStorage | null => {
  const isServerRender = typeof window === 'undefined';
  if (isServerRender) {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

class SocialPreferencesStore {
  preferences = $state<SocialPreferences>({ ...DEFAULT_SOCIAL_PREFERENCES });

  constructor() {
    this.preferences = loadSocialPreferences(resolveStorage());
  }

  save(updates: Partial<SocialPreferences>) {
    this.preferences = applySocialPreferenceUpdates(this.preferences, updates);
    saveSocialPreferences(resolveStorage(), this.preferences);
  }
}

export const socialPreferencesStore = new SocialPreferencesStore();
