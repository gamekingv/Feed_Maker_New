let port, app, store, isInitialized = true, messageQueue = {}, midCount = 0;

const message = {
    async init(vm) {
        const handler = this.handlesInitializedMessage.bind(this);
        browser.runtime.onMessage.addListener(handler);
        port = browser.runtime.connect({ name: Date.now().toString() });
        port.onMessage.addListener(this.messageListener.bind(this));
        app = vm;
        store = vm.$store;
        isInitialized = await this.send({ action: 'get initialize state' });
        if (isInitialized) browser.runtime.onMessage.removeListener(handler);
        return isInitialized;
    },
    handlesInitializedMessage(request) {
        if (request && request.action === 'initialize complete' && !isInitialized) {
            location.reload();
        }
    },
    async messageListener({ mid, action, data, state }) {
        switch (action) {
            case 'background update': {
                store.state.groups.reduce((total, group) => group.active ? total.concat(group.feeds) : total, []).forEach(feed => feed.active && store.dispatch('updateFeedState', { id: feed.id, isLoading: true }));
                break;
            }
            case 'background update complete': {
                let { id, result: unread } = data;
                await store.dispatch('updateFeedState', { id, unread, errorMessage: '', isLoading: false });
                if (store.state.active.type === 'list' && unread > 0) app.refreshList({ type: 'feed', id, isUpdateComplete: true });
                break;
            }
            case 'background update fail': {
                let { id, errorMessage } = data;
                await store.dispatch('updateFeedState', { id, errorMessage, isLoading: false });
                break;
            }
            case 'background synchronization complete': {
                store.dispatch('updateLast');
                break;
            }
            case 'background detect new config': {
                app.newConfigDetected(data.config);
                break;
            }
            case 'response': {
                if (state === 'ok') messageQueue[mid].resolve(data);
                else if (state === 'fail') {
                    messageQueue[mid].reject(data);
                }
                delete messageQueue[mid];
                break;
            }
            case 'alert': {
                let { message } = data;
                app.$addInfo(message, 'warning');
                break;
            }
        }
    },
    send(request) {
        request.mid = (midCount++).toString();
        port.postMessage(request);
        return new Promise((resolve, reject) => messageQueue[request.mid] = { resolve, reject });
    },
    async sendGetCount(type, id, state = store.state.settings.view) {
        try {
            state = state.replace('all', '');
            return await this.send({
                action: 'getCount', data: {
                    type, id,
                    state: state
                }
            });
        }
        catch (e) { app.$throw(e); }
    },
    async sendGet(type, id, page, state = store.state.settings.view.replace('all', ''), active) {
        try {
            return await this.send({
                action: 'getItems', data: {
                    type, id, page, state, active,
                    amount: page ? store.state.settings.itemsPerPage : null,
                }
            });
        }
        catch (e) { app.$throw(e); }
    },
    async sendUpdate(type, id) {
        try {
            return await this.send({ action: 'update', data: { type, id } });
        }
        catch (e) { app.$throw(e); }
    },
    sendModifyItems(ids, keyValues) {
        try {
            return this.send({ action: 'modify', data: { ids, keyValues } });
        }
        catch (e) { app.$throw(e); }
    },
    sendMarkItemsAsRead(ids) {
        return this.sendModifyItems(ids, { state: 'read' });
    },
    async sendMarkAllItemsAsRead(type, id) {
        let items = await this.sendGet(type, id, null, 'unread');
        return await this.sendModifyItems(items.map(item => item.id), { state: 'read' });
    },
    sendMarkItemsAsUnread(ids) {
        return this.sendModifyItems(ids, { state: 'unread' });
    },
    async sendFetchSource(feed) {
        try {
            let { result, data } = await this.send({ action: 'fetch source', data: { feed } });
            return { result, data };
        }
        catch (e) { return { result: 'fail', data: e.toString() }; }
    },
    async sendParseSource(source, steps, baseSteps) {
        try {
            return await this.send({ action: 'parse source', data: { source, steps, baseSteps } });
        }
        catch (e) { return e.toString(); }
    },
    sendDeleteFeed(id) {
        try {
            return this.send({ action: 'delete feed', data: { id } });
        }
        catch (e) { app.$throw(e); }
    },
    sendDeleteGroup(id) {
        try {
            return this.send({ action: 'delete group', data: { id } });
        }
        catch (e) { app.$throw(e); }
    },
    sendClearDataBase() {
        try {
            return this.send({ action: 'clear database' });
        }
        catch (e) { app.$throw(e); }
    },
    async sendChangeItemsActive(type, id, active) {
        let items = await this.sendGet(type, id, null, 'unread', (!(active === 'true')).toString());
        return await this.sendModifyItems(items.map(item => item.id), { active });
    },
    sendChangeItemCollectionId(id, collectionId) {
        return this.sendModifyItems([id], { collectionId });
    },
    sendGetItemsByCollectionId(ids) {
        return this.sendGet('collection', ids);
    },
    changeAutoUpdate(state) {
        try {
            return this.send({ action: 'change autoUpdate', data: { state } });
        }
        catch (e) { app.$throw(e); }
    },
    changeAutoUpdateFrequency() {
        try {
            return this.send({ action: 'change autoUpdateFrequency' });
        }
        catch (e) { app.$throw(e); }
    },
    changeMaxThread() {
        try {
            return this.send({ action: 'change maxThread' });
        }
        catch (e) { app.$throw(e); }
    },
    synchronize(isForced = false) {
        try {
            return this.send({ action: 'synchronize', data: { isForced } });
        }
        catch (e) { app.$throw(e); }
    },
    changeAutoSync(state) {
        try {
            return this.send({ action: 'change autoSync', data: { state } });
        }
        catch (e) { app.$throw(e); }
    },
    changeAutoSyncFrequency() {
        try {
            return this.send({ action: 'change autoSyncFrequency' });
        }
        catch (e) { app.$throw(e); }
    }
};

export default message;