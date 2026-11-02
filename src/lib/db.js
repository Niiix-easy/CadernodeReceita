const DB_NAME = 'RecipeDB';
const STORE_NAME = 'items';
export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};
export const saveItems = async (items) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    items.forEach(item => tx.objectStore(STORE_NAME).put(item));
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
};
export const getItems = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const request = db.transaction(STORE_NAME).objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};
