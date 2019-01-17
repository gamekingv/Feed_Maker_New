import store from '~/store';
import Vue from 'vue';

const message = {
    init(app) {
        browser.runtime.onMessage.addListener(async ({ action, data }, sender) => {
            if (sender.url.indexOf('_generated_background_page.html') === -1) return;
            switch (action) {
                case 'background update': {
                    Object.keys(store.state.feedState).forEach(id => store.dispatch('updateFeedState', { id, isLoading: true }));
                    break;
                }
                case 'background update complete': {
                    let { id, result: unread } = data;
                    await store.dispatch('updateFeedState', { id, unread, errorMessage: '', isLoading: false });
                    if (store.state.active.type === 'list') app.refreshList({ type: 'feed', id, isUpdateComplete: true });
                    break;
                }
                case 'background update fail': {
                    let { id, errorMessage } = data;
                    await store.dispatch('updateFeedState', { id, errorMessage, isLoading: false });
                    break;
                }
            }
        });
    },
    send(payload) {
        return browser.runtime.sendMessage(payload);
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
        catch (e) { Vue.throw(e); }
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
        catch (e) { Vue.throw(e); }
    },
    async sendUpdate(type, id) {
        try {
            return await this.send({ action: 'update', data: { type, id } });
        }
        catch (e) { Vue.throw(e); }
    },
    sendModifyItems(ids, keyValues) {
        try {
            return this.send({ action: 'modify', data: { ids, keyValues } });
        }
        catch (e) { Vue.throw(e); }
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
    sendFetchSource(feed) {
        try {
            return this.send({ action: 'fetch source', data: { feed } });
        }
        catch (e) { return e.toString(); }
    },
    sendParseSource(source, type, steps) {
        try {
            return this.send({ action: 'parse source', data: { source, type, steps } });
        }
        catch (e) { return e.toString(); }
    },
    sendDeleteFeed(id) {
        try {
            return this.send({ action: 'delete feed', data: { id } });
        }
        catch (e) { Vue.throw(e); }
    },
    sendDeleteGroup(id) {
        try {
            return this.send({ action: 'delete group', data: { id } });
        }
        catch (e) { Vue.throw(e); }
    },
    sendClearDataBase() {
        try {
            return this.send({ action: 'clear database' });
        }
        catch (e) { Vue.throw(e); }
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
        catch (e) { Vue.throw(e); }
    },
    changeAutoUpdateFrequency() {
        try {
            return this.send({ action: 'change autoUpdateFrequency' });
        }
        catch (e) { Vue.throw(e); }
    }
};

export default message;