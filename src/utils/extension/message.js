
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
    async sendGet(type, id) {
        let { result, data } = await this.send({ action: 'get', data: { type, id } });
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
            if (result === 'ok') {
                return this.sendGet(type, id);
            }
            else if (result === 'fail') {
                throw data;
            }
        }
        catch (e) { throw e; }
    },
    sendUpdateFeed(id) {
        return this.sendUpdate('feed', id);
    }
};

export default message;