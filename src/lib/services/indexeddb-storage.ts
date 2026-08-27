import type { Lead } from '../types/lead';

const DB_NAME = 'LicensifyDB';
const DB_VERSION = 1;
const STORE_NAME = 'leads';

export class IndexedDBStorage {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('IndexedDB is only available in browser environments.'));
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('profession', 'profession', { unique: false });
          store.createIndex('state', 'state', { unique: false });
          store.createIndex('outreachStatus', 'outreachStatus', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = (event: Event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event: Event) => {
        console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  public static async getAllLeads(): Promise<Lead[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.warn('IndexedDB getAllLeads error, falling back to empty', error);
      return [];
    }
  }

  private static serialize<T>(data: T): T {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (e) {
      console.warn('Serialization fallback in IndexedDBStorage', e);
      return data;
    }
  }

  public static async saveLead(lead: Lead): Promise<void> {
    try {
      const db = await this.getDB();
      const rawLead = this.serialize(lead);
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(rawLead);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('IndexedDB saveLead error', error);
    }
  }

  public static async saveAllLeads(leads: Lead[]): Promise<void> {
    try {
      const db = await this.getDB();
      const rawLeads = this.serialize(leads);
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);

        for (const lead of rawLeads) {
          store.put(lead);
        }
      });
    } catch (error) {
      console.warn('IndexedDB saveAllLeads error', error);
    }
  }

  public static async deleteLead(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('IndexedDB deleteLead error', error);
    }
  }

  public static async clearAll(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('IndexedDB clearAll error', error);
    }
  }
}
