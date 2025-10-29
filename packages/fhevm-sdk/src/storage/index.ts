import type { FHEVMStorage } from "../types.js";

/**
 * Create a default storage implementation using IndexedDB
 */
export function createDefaultStorage(): FHEVMStorage {
  return new IndexedDBStorage();
}

/**
 * Create an in-memory storage implementation
 */
export function createInMemoryStorage(): FHEVMStorage {
  return new InMemoryStorage();
}

/**
 * Create a localStorage-based storage implementation
 */
export function createLocalStorage(): FHEVMStorage {
  return new LocalStorage();
}

/**
 * IndexedDB-based storage implementation
 */
class IndexedDBStorage implements FHEVMStorage {
  private dbName = "fhevm-storage";
  private storeName = "fhevm-data";
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readonly");
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      });
    } catch (error) {
      console.warn("IndexedDB get failed:", error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.put(value, key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.warn("IndexedDB set failed:", error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.warn("IndexedDB remove failed:", error);
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.warn("IndexedDB clear failed:", error);
    }
  }
}

/**
 * In-memory storage implementation
 */
class InMemoryStorage implements FHEVMStorage {
  private data = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.data.get(key) || null;
  }

  async set(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.data.delete(key);
  }

  async clear(): Promise<void> {
    this.data.clear();
  }
}

/**
 * localStorage-based storage implementation
 */
class LocalStorage implements FHEVMStorage {
  private prefix = "fhevm:";

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(this.getKey(key));
    } catch (error) {
      console.warn("localStorage get failed:", error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(this.getKey(key), value);
    } catch (error) {
      console.warn("localStorage set failed:", error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.warn("localStorage remove failed:", error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn("localStorage clear failed:", error);
    }
  }
}
export * from "./GenericStringStorage.js";
export * from "./GenericStringStorage.js";
