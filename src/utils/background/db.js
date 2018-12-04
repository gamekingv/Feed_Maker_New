const DB_NAME = 'feedMakerStorage',
    DB_VERSION = '1',
    DB_ITEM_STORE_NAME = 'items',
    DB_COLLECTION_STORE_NAME = 'collections';

let db;

const database = {
    init() {
        return new Promise((resolve, reject) => {
            let request = window.indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = reject;
            request.onsuccess = e => {
                db = e.target.result;
                resolve();
            };
            request.onupgradeneeded = e => {
                db = e.target.result;
                if (!db.objectStoreNames.contains(DB_ITEM_STORE_NAME)) {
                    let itemStore = db.createObjectStore(DB_ITEM_STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    itemStore.createIndex('pubDate', 'pubDate');
                    itemStore.createIndex('feedId', ['feedId', 'pubDate']);
                    itemStore.createIndex('groupId', ['groupId', 'pubDate']);
                    itemStore.createIndex('url', ['feedId', 'url', 'pubDate']);
                    itemStore.createIndex('pubDateWithState', ['state', 'pubDate']);
                    itemStore.createIndex('feedIdWithState', ['feedId', 'state', 'pubDate']);
                    itemStore.createIndex('groupIdWithState', ['groupId', 'state', 'pubDate']);
                }
                if (!db.objectStoreNames.contains(DB_COLLECTION_STORE_NAME)) {
                    db.createObjectStore(DB_COLLECTION_STORE_NAME, { keyPath: 'id', autoIncrement: true });
                }
                resolve();
            };
        });
    },
    startStore(name) {
        return new Promise((resolve, reject) => {
            let transaction = db.transaction([name], 'readwrite');
            transaction.onerror = reject;
            resolve(transaction.objectStore(name));
        });
    },
    getAllItems() {
        return this.startStore(DB_ITEM_STORE_NAME).then(objectStore => {
            return new Promise((resolve, reject) => {
                let request = objectStore.index('pubDate').openCursor(null, 'prev'), result = [];
                request.onerror = reject;
                request.onsuccess = e => {
                    let cursor = e.target.result;
                    if (cursor) {
                        result.push(cursor.value);
                        cursor.continue();
                    }
                    else {
                        console.log(result);
                        resolve(result);
                    }
                };
            });
        });
    },
    getItemsByFeedId(feedId) {
        return this.startStore(DB_ITEM_STORE_NAME).then(objectStore => new Promise((resolve, reject) => {
            let keyRange = IDBKeyRange.bound([feedId, 0], [feedId, Number.POSITIVE_INFINITY]),
                request = objectStore.index('feedId').openCursor(keyRange, 'prev'), result = [];
            request.onerror = reject;
            request.onsuccess = e => {
                let cursor = e.target.result;
                if (cursor) {
                    result.push(cursor.value);
                    cursor.continue();
                }
                else {
                    resolve(result);
                }
            };
        }));
    },
    getItemsByGroupId(groupId) {
        return this.startStore(DB_ITEM_STORE_NAME).then(objectStore => new Promise((resolve, reject) => {
            let keyRange = IDBKeyRange.bound([groupId, 0], [groupId, Number.POSITIVE_INFINITY]),
                request = objectStore.index('groupId').openCursor(keyRange, 'prev'), result = [];
            request.onerror = reject;
            request.onsuccess = e => {
                let cursor = e.target.result;
                if (cursor) {
                    result.push(cursor.value);
                    cursor.continue();
                }
                else {
                    resolve(result);
                }
            };
        }));
    },
    addItems(items) {
        return this.getItemsByFeedId(items[0].feedId).then(oldItems => {
            items.forEach(item => {
                if (oldItems.findIndex(oldItem => oldItem.url === item.url && oldItem.title === item.title) > -1) {
                    item.state = 'read';
                }
                else {
                    item.state = 'unread';
                }
            });
            if (items.some(item => item.state === 'unread')) {
                return this.deleteItems(oldItems.map(oldItem => oldItem.id)).then(() => this.startStore(DB_ITEM_STORE_NAME)).then(objectStore => new Promise((resolve, reject) => {
                    let count = 0;
                    for (let item of items) {
                        let request = objectStore.add(item);
                        request.onerror = reject;
                        request.onsuccess = () => ++count === items.length && resolve();
                    }
                }));
            }
            else {
                return Promise.resolve(0);
            }
        });
    },
    deleteItems(keys) {
        if (keys.length === 0) return Promise.resolve();
        return this.startStore(DB_ITEM_STORE_NAME).then(objectStore => new Promise((resolve, reject) => {
            let count = 0;
            for (let key of keys) {
                let request = objectStore.delete(key);
                request.onerror = reject;
                request.onsuccess = () => ++count === keys.length && resolve();
            }
        }));
    }
};

export default database;