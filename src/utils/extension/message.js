import store from '~/store';

const message = {
    init() {
        browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log('Message from the background script: ' + request.test);
            sendResponse({ test: 'Response from browser action page' });
        });
    },
    send(payload) {
        return browser.runtime.sendMessage(payload);
    },
    async sendGetCount(type, id) {
        let { result, data } = await this.send({ action: 'getCount', data: { type, id } });
        if (result === 'ok') {
            return data;
        }
        else if (result === 'fail') {
            throw data;
        }
    },
    async sendGet(type, id, page) {
        let { result, data } = await this.send({ action: 'getItems', data: { type, id, page, amount: store.state.settings.itemsPerPage } });
        if (result === 'ok') {
            return data;
        }
        else if (result === 'fail') {
            throw data;
        }
    },
    async sendUpdate(type, id) {
        try {
            let { result, data } = await this.send({ action: 'update', data: { type, id } });
            return { result, data };
        }
        catch (e) { throw e; }
    },
    sendUpdateFeed(id) {
        return this.sendUpdate('feed', id);
    },
    sendModifyItems(ids, keyValues) {
        return this.send({ action: 'modify', data: { ids, keyValues } });
    },
    sendMarkItemsAsRead(ids) {
        return this.sendModifyItems(ids, { state: 'read' });
    },
    sendMarkItemsAsUnread(ids) {
        return this.sendModifyItems(ids, { state: 'unread' });
    }
};

export default message;