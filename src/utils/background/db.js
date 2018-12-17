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
    makeParm(type, id, state) {
        let index = type, keyRange, upperBound = [], lowerBound = [];
        if (!id && !state) return { index, keyRange };
        if (id) {
            upperBound.push(id);
            lowerBound.push(id);
        }
        if (state) {
            index += 'WithState';
            upperBound.push(state);
            lowerBound.push(state);
        }
        upperBound.push(0);
        lowerBound.push(Number.POSITIVE_INFINITY);
        keyRange = IDBKeyRange.bound(upperBound, lowerBound);
        return { index, keyRange };
    },
    getItems(index, keyRange, page, amount) {
        return this.startStore(DB_ITEM_STORE_NAME).then(objectStore => new Promise((resolve, reject) => {
            let request = objectStore.index(index).openCursor(keyRange, 'prev'), result = [], skipped = false;
            request.onerror = reject;
            request.onsuccess = e => {
                let cursor = e.target.result;
                if (cursor && (!amount || result.length < amount)) {
                    if (!skipped && page && page > 1) {
                        skipped = true;
                        cursor.advance((page - 1) * amount);
                        return;
                    }
                    result.push(cursor.value);
                    cursor.continue();
                }
                else {
                    resolve(result);
                }
            };
        }));
    },
    getItemsCount(index, keyRange) {
        return this.startStore(DB_ITEM_STORE_NAME).then(objectStore => new Promise((resolve, reject) => {
            let request = objectStore.index(index).count(keyRange);
            request.onerror = reject;
            request.onsuccess = e => resolve(e.target.result);
        }));
    },
    getItemsById(id) {
        return this.startStore(DB_ITEM_STORE_NAME).then(objectStore => new Promise((resolve, reject) => {
            let request = objectStore.get(id);
            request.onerror = reject;
            request.onsuccess = function (e) {
                resolve(e.target.result);
            };
        }));
    },
    getAllItems(page, amount, state) {
        let { index, keyRange } = this.makeParm('pubDate', null, state);
        return this.getItems(index, keyRange, page, amount);
    },
    getAllItemsCount(state) {
        let { index, keyRange } = this.makeParm('pubDate', null, state);
        return this.getItemsCount(index, keyRange);
    },
    getItemsByFeedId(feedId, page, amount, state) {
        let { index, keyRange } = this.makeParm('feedId', feedId, state);
        return this.getItems(index, keyRange, page, amount);
    },
    getItemsCountByFeedId(feedId, state) {
        let { index, keyRange } = this.makeParm('feedId', feedId, state);
        return this.getItemsCount(index, keyRange);
    },
    getItemsByGroupId(groupId, page, amount, state) {
        let { index, keyRange } = this.makeParm('groupId', groupId, state);
        return this.getItems(index, keyRange, page, amount);
    },
    getItemsCountByGroupId(groupId, state) {
        let { index, keyRange } = this.makeParm('groupId', groupId, state);
        return this.getItemsCount(index, keyRange);
    },
    addItems(items) {
        return this.getItemsByFeedId(items[0].feedId).then(oldItems => {
            let unreadCount = 0;
            items.forEach(item => {
                if (oldItems.findIndex(oldItem => oldItem.url === item.url && oldItem.title === item.title && oldItem.state === 'read') > -1) {
                    item.state = 'read';
                }
                else {
                    item.state = 'unread';
                    unreadCount++;
                }
            });
            if (unreadCount > 0) {
                return this.deleteItems(oldItems.map(oldItem => oldItem.id)).then(() => this.startStore(DB_ITEM_STORE_NAME)).then(objectStore => new Promise((resolve, reject) => {
                    let count = 0;
                    for (let item of items) {
                        let request = objectStore.add(item);
                        request.onerror = reject;
                        request.onsuccess = () => ++count === items.length && resolve(unreadCount);
                    }
                }));
            }
            else {
                return Promise.resolve(0);
            }
        });
    },
    updateItems(ids, keyValues) {
        return Promise.all(ids.map(id => new Promise(async (resolve, reject) => {
            try {
                let item = await this.getItemsById(id),
                    objectStore = await this.startStore(DB_ITEM_STORE_NAME);
                Object.entries(keyValues).map(([key, value]) => item[key] = value);
                let request = objectStore.put(item);
                request.onerror = reject;
                request.onsuccess = () => resolve();
            }
            catch (e) { reject(e); }
        })));
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