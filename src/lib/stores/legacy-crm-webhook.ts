/**
 * An earlier build kept the CRM webhook URL in the browser under LEGACY_CRM_WEBHOOK_KEY and
 * posted leads to it from the page. A webhook URL is a bearer credential (anyone holding it can
 * write into the CRM), so it now lives in the WordPress Connectors API (`crm_webhook_url`) and
 * only the server uses it. Loading the app deletes any copy this browser still holds.
 */

export const LEGACY_CRM_WEBHOOK_KEY = 'licensify_crm_webhook';

export type LegacyWebhookStorage = Pick<Storage, 'getItem' | 'removeItem'>;

/** Deletes the legacy value. Returns true when one was present, so a caller can tell. */
export const purgeLegacyCrmWebhook = (storage: LegacyWebhookStorage | null): boolean => {
  const isStorageUnavailable = storage === null;
  if (isStorageUnavailable) {
    return false;
  }
  try {
    const hadLegacyValue = storage.getItem(LEGACY_CRM_WEBHOOK_KEY) !== null;
    storage.removeItem(LEGACY_CRM_WEBHOOK_KEY);
    return hadLegacyValue;
  } catch {
    // chemx-allow: best-effort storage is blocked, so there is nothing further this code can remove
    return false;
  }
};

export const purgeLegacyCrmWebhookFromBrowser = (): boolean => {
  const isServerRender = typeof window === 'undefined';
  if (isServerRender) {
    return false;
  }
  try {
    return purgeLegacyCrmWebhook(window.localStorage);
  } catch {
    // chemx-allow: best-effort reading window.localStorage throws when site data is blocked
    return false;
  }
};
