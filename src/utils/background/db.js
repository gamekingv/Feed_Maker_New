const DB_NAME = 'feedMakerStorage',
    DB_VERSION = '1',
    DB_ITEM_STORE_NAME = 'items';

let db;

const database = {
    init() {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = reject;
            request.onsuccess = e => {
                db = e.target.result;
                resolve();
            };
            request.onupgradeneeded = e => {
                db = e.target.result;
                if (!db.objectStoreNames.contains(DB_ITEM_STORE_NAME)) {
                    let itemStore = db.createObjectStore(DB_ITEM_STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    itemStore.createIndex('pubDate', ['active', 'pubDate']);
                    itemStore.createIndex('feedId', ['feedId', 'active', 'pubDate']);
                    itemStore.createIndex('groupId', ['groupId', 'active', 'pubDate']);
                    itemStore.createIndex('pubDateWithState', ['state', 'active', 'pubDate']);
                    itemStore.createIndex('feedIdWithState', ['feedId', 'state', 'active', 'pubDate']);
                    itemStore.createIndex('groupIdWithState', ['groupId', 'state', 'active', 'pubDate']);
                    itemStore.createIndex('collectionId', 'collectionId');
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
    makeParm({ type, id, state, active = 'true' }) {
        let index = type, keyRange, upperBound = [], lowerBound = [];
        if (id) {
            upperBound.push(id);
            lowerBound.push(id);
        }
        if (state) {
            index += 'WithState';
            upperBound.push(state);
            lowerBound.push(state);
        }
        upperBound.push(active);
        lowerBound.push(active);
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
    getAllItems(page, amount, state, active) {
        let { index, keyRange } = this.makeParm({ type: 'pubDate', state, active });
        return this.getItems(index, keyRange, page, amount);
    },
    getAllItemsCount(state) {
        let { index, keyRange } = this.makeParm({ type: 'pubDate', state });
        return this.getItemsCount(index, keyRange);
    },
    getItemsByFeedId(id, page, amount, state, active) {
        let { index, keyRange } = this.makeParm({ type: 'feedId', id, state, active });
        return this.getItems(index, keyRange, page, amount);
    },
    getItemsCountByFeedId(id, state) {
        let { index, keyRange } = this.makeParm({ type: 'feedId', id, state });
        return this.getItemsCount(index, keyRange);
    },
    getItemsByGroupId(id, page, amount, state, active) {
        let { index, keyRange } = this.makeParm({ type: 'groupId', id, state, active });
        return this.getItems(index, keyRange, page, amount);
    },
    getItemsCountByGroupId(id, state) {
        let { index, keyRange } = this.makeParm({ type: 'groupId', id, state });
        return this.getItemsCount(index, keyRange);
    },
    async getItemsByCollectionId(ids) {
        let itemsArray = await Promise.all(ids.map(id => this.getItems('collectionId', IDBKeyRange.only(id)))),
            items = itemsArray.reduce((items, item) => items.concat(item), []);
        return items;
    },
    addItems(items) {
        return this.getItemsByFeedId(items[0].feedId).then(oldItems => {
            let unreadCount = 0;
            items.forEach(item => {
                let index = oldItems.findIndex(oldItem => oldItem.url === item.url && oldItem.title === item.title);
                if (index > -1) {
                    if (oldItems[index].state === 'read') {
                        item.state = 'read';
                    }
                    else {
                        item.state = 'unread';
                        unreadCount++;
                    }
                    item.collectionId = oldItems[index].collectionId;
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
                        request.onsuccess = () => {
                            if (++count === items.length) {
                                this.updateBadgeText();
                                resolve(unreadCount);
                            }
                        };
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
                request.onsuccess = () => {
                    this.updateBadgeText();
                    resolve();
                };
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
                request.onsuccess = () => {
                    if (++count === keys.length) {
                        this.updateBadgeText();
                        resolve();
                    }
                };
            }
        }));
    },
    clearDataBase() {
        return this.startStore(DB_ITEM_STORE_NAME).then(objectStore => new Promise((resolve) => objectStore.clear().onsuccess = () => resolve())).then(() => this.updateBadgeText());
    },
    updateBadgeText() {
        return this.getAllItemsCount('unread').then(count => browser.browserAction.setBadgeText({ text: count === 0 ? '' : count < 100 ? count.toString() : '99+' }));
    }
};

export default database;