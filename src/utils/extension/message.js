import store from '~/store';
import Vue from 'vue';

const message = {
    init(app) {
        browser.runtime.onMessage.addListener(async ({ action, data }) => {
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
        state = state.replace('all', '');
        let { result, data } = await this.send({
            action: 'getCount', data: {
                type, id,
                state: state
            }
        });
        if (result === 'ok') {
            return data;
        }
        else if (result === 'fail') {
            Vue.throw(data);
        }
    },
    async sendGet(type, id, page, state = store.state.settings.view.replace('all', ''), active) {
        let { result, data } = await this.send({
            action: 'getItems', data: {
                type, id, page, state, active,
                amount: page ? store.state.settings.itemsPerPage : null,
            }
        });
        if (result === 'ok') {
            return data;
        }
        else if (result === 'fail') {
            Vue.throw(data);
            return [];
        }
    },
    async sendUpdate(type, id) {
        try {
            return await this.send({ action: 'update', data: { type, id } });
        }
        catch (e) { Vue.throw(e); }
    },
    sendModifyItems(ids, keyValues) {
        return this.send({ action: 'modify', data: { ids, keyValues } });
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
        return this.send({ action: 'fetch source', data: { feed } });
    },
    sendParseSource(source, type, steps) {
        return this.send({ action: 'parse source', data: { source, type, steps } });
    },
    sendDeleteFeed(id) {
        return this.send({ action: 'delete feed', data: { id } });
    },
    sendDeleteGroup(id) {
        return this.send({ action: 'delete group', data: { id } });
    },
    sendClearDataBase() {
        return this.send({ action: 'clear database' });
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
        return this.send({ action: 'change autoUpdate', data: { state } });
    },
    changeAutoUpdateFrequency() {
        return this.send({ action: 'change autoUpdateFrequency' });
    }
};

export default message;