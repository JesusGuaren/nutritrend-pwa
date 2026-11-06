/**
 * Fase 2 (Sección 7.3): Cola Offline Persistente en IndexedDB
 * Almacena mutaciones pendientes cuando el dispositivo no tiene conexión a internet
 * o falla la sincronización remota, para reintentar automáticamente al recuperar red.
 */

const DB_NAME = 'nutritrend_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'pending_mutations';

function openOfflineDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const offlineQueue = {
  async enqueue(mutation) {
    try {
      const db = await openOfflineDB();
      if (!db) return null;

      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const item = {
          ...mutation,
          createdAt: new Date().toISOString()
        };
        const req = store.add(item);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Error encolando en IndexedDB:', err);
      return null;
    }
  },

  async getAllPending() {
    try {
      const db = await openOfflineDB();
      if (!db) return [];

      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  },

  async removeById(id) {
    try {
      const db = await openOfflineDB();
      if (!db) return;

      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Error limpiando item de IndexedDB:', err);
    }
  },

  async clearAll() {
    try {
      const db = await openOfflineDB();
      if (!db) return;

      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Error vaciando IndexedDB:', err);
    }
  }
};
