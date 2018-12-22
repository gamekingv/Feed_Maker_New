import store from '~/store';

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
                    await store.dispatch('updateFeedState', { id, unread, isLoading: false });
                    if (store.state.active.type === 'list') app.refreshList({ type: 'feed', id, isUpdateComplete: true });
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
            throw data;
        }
    },
    async sendGet(type, id, page, state = store.state.settings.view.replace('all', '')) {
        let { result, data } = await this.send({
            action: 'getItems', data: {
                type, id, page,
                amount: page ? store.state.settings.itemsPerPage : null,
                state: state
            }
        });
        if (result === 'ok') {
            return data;
        }
        else if (result === 'fail') {
            throw data;
        }
    },
    async sendUpdate(type, id) {
        try {
            return await this.send({ action: 'update', data: { type, id } });
        }
        catch (e) { throw e; }
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
    }
};

export default message;