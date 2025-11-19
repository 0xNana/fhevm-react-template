/**
 * Create a default storage implementation using IndexedDB
 */
export function createDefaultStorage() {
    return new IndexedDBStorage();
}
/**
 * Create an in-memory storage implementation
 */
export function createInMemoryStorage() {
    return new InMemoryStorage();
}
/**
 * Create a localStorage-based storage implementation
 */
export function createLocalStorage() {
    return new LocalStorage();
}
/**
 * IndexedDB-based storage implementation
 */
class IndexedDBStorage {
    dbName = "fhevm-storage";
    storeName = "fhevm-data";
    db = null;
    async getDB() {
        if (this.db)
            return this.db;
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
    async get(key) {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], "readonly");
                const store = transaction.objectStore(this.storeName);
                const request = store.get(key);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result || null);
            });
        }
        catch (error) {
            console.warn("IndexedDB get failed:", error);
            return null;
        }
    }
    async set(key, value) {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], "readwrite");
                const store = transaction.objectStore(this.storeName);
                const request = store.put(value, key);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve();
            });
        }
        catch (error) {
            console.warn("IndexedDB set failed:", error);
        }
    }
    async remove(key) {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], "readwrite");
                const store = transaction.objectStore(this.storeName);
                const request = store.delete(key);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve();
            });
        }
        catch (error) {
            console.warn("IndexedDB remove failed:", error);
        }
    }
    async clear() {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], "readwrite");
                const store = transaction.objectStore(this.storeName);
                const request = store.clear();
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve();
            });
        }
        catch (error) {
            console.warn("IndexedDB clear failed:", error);
        }
    }
}
/**
 * In-memory storage implementation
 */
class InMemoryStorage {
    data = new Map();
    async get(key) {
        return this.data.get(key) || null;
    }
    async set(key, value) {
        this.data.set(key, value);
    }
    async remove(key) {
        this.data.delete(key);
    }
    async clear() {
        this.data.clear();
    }
}
/**
 * localStorage-based storage implementation
 */
class LocalStorage {
    prefix = "fhevm:";
    getKey(key) {
        return `${this.prefix}${key}`;
    }
    async get(key) {
        try {
            return localStorage.getItem(this.getKey(key));
        }
        catch (error) {
            console.warn("localStorage get failed:", error);
            return null;
        }
    }
    async set(key, value) {
        try {
            localStorage.setItem(this.getKey(key), value);
        }
        catch (error) {
            console.warn("localStorage set failed:", error);
        }
    }
    async remove(key) {
        try {
            localStorage.removeItem(this.getKey(key));
        }
        catch (error) {
            console.warn("localStorage remove failed:", error);
        }
    }
    async clear() {
        try {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            }
        }
        catch (error) {
            console.warn("localStorage clear failed:", error);
        }
    }
}
export * from "./GenericStringStorage.js";
export * from "./GenericStringStorage.js";
//# sourceMappingURL=index.js.map