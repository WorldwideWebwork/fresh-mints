import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  LEGACY_CRM_WEBHOOK_KEY,
  purgeLegacyCrmWebhook,
  purgeLegacyCrmWebhookFromBrowser,
  type LegacyWebhookStorage,
} from './legacy-crm-webhook';

const makeStorage = (initial: Record<string, string> = {}) => {
  const data = new Map<string, string>(Object.entries(initial));
  const storage: LegacyWebhookStorage = {
    getItem: (key) => data.get(key) ?? null,
    removeItem: (key) => void data.delete(key),
  };
  return { storage, data };
};

// A placeholder shaped like a webhook URL. It is not a real credential.
const LEGACY_VALUE = 'https://hooks.example.test/hooks/catch/placeholder-value';

describe('purgeLegacyCrmWebhook', () => {
  it('deletes the legacy webhook URL and reports that one was present', () => {
    const { storage, data } = makeStorage({ [LEGACY_CRM_WEBHOOK_KEY]: LEGACY_VALUE });

    const hadLegacyValue = purgeLegacyCrmWebhook(storage);

    expect(hadLegacyValue).toBe(true);
    expect(data.has(LEGACY_CRM_WEBHOOK_KEY)).toBe(false);
    expect([...data.values()].join('\n')).not.toContain('placeholder-value');
  });

  it('deletes an empty legacy value too, since the key itself is the leftover', () => {
    const { storage, data } = makeStorage({ [LEGACY_CRM_WEBHOOK_KEY]: '' });

    expect(purgeLegacyCrmWebhook(storage)).toBe(true);
    expect(data.has(LEGACY_CRM_WEBHOOK_KEY)).toBe(false);
  });

  it('leaves every other key alone', () => {
    const { storage, data } = makeStorage({
      [LEGACY_CRM_WEBHOOK_KEY]: LEGACY_VALUE,
      licensify_fetch_quantity: '50',
      fm_default_bomb_bag_list: '7',
    });

    purgeLegacyCrmWebhook(storage);

    expect(Object.fromEntries(data)).toEqual({ licensify_fetch_quantity: '50', fm_default_bomb_bag_list: '7' });
  });

  it('reports nothing to purge when the key is absent', () => {
    const { storage } = makeStorage({ licensify_fetch_quantity: '25' });

    expect(purgeLegacyCrmWebhook(storage)).toBe(false);
  });

  it('does nothing when storage is unavailable', () => {
    expect(purgeLegacyCrmWebhook(null)).toBe(false);
  });

  it('does not throw when storage is blocked', () => {
    const blocked: LegacyWebhookStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };

    expect(purgeLegacyCrmWebhook(blocked)).toBe(false);
  });
});

describe('purgeLegacyCrmWebhookFromBrowser', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('purges the value from window.localStorage', () => {
    const { storage, data } = makeStorage({ [LEGACY_CRM_WEBHOOK_KEY]: LEGACY_VALUE });
    vi.stubGlobal('window', { localStorage: storage });

    expect(purgeLegacyCrmWebhookFromBrowser()).toBe(true);
    expect(data.has(LEGACY_CRM_WEBHOOK_KEY)).toBe(false);
  });

  it('does not throw when reading window.localStorage throws', () => {
    vi.stubGlobal('window', {
      get localStorage(): Storage {
        throw new Error('site data blocked');
      },
    });

    expect(purgeLegacyCrmWebhookFromBrowser()).toBe(false);
  });

  it('does nothing outside a browser', () => {
    vi.stubGlobal('window', undefined);

    expect(purgeLegacyCrmWebhookFromBrowser()).toBe(false);
  });
});
