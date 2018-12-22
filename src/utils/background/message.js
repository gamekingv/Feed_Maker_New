import crawler from './crawler';
import db from './db';

const message = {
    isInitialized: false,
    init() {
        browser.runtime.onMessage.addListener(({ action, data }, sender, sendResponse) => {
            switch (action) {
                case 'update': {
                    let { type, id } = data;
                    if (type === 'group') {
                        if (id === 'all') {
                            crawler.updateAll();
                        }
                        else {
                            crawler.updateGroup(id);
                        }
                    }
                    else if (type === 'feed') {
                        crawler.updateFeed({ id });
                    }
                    return;
                }
                case 'getItems': {
                    let { type, id, page, amount, state } = data;
                    if (type === 'group') {
                        let request = id === 'all' ? db.getAllItems(page, amount, state) : db.getItemsByGroupId(id, page, amount, state);
                        request.then(items => sendResponse({ result: 'ok', data: items }))
                            .catch(e => sendResponse({ result: 'fail', data: e }));
                    }
                    else if (type === 'feed') {
                        db.getItemsByFeedId(id, page, amount, state)
                            .then(items => sendResponse({ result: 'ok', data: items }))
                            .catch(e => sendResponse({ result: 'fail', data: e }));
                    }
                    break;
                }
                case 'getCount': {
                    let { type, id, state } = data;
                    if (type === 'group') {
                        let request = data.id === 'all' ? db.getAllItemsCount(state) : db.getItemsCountByGroupId(id, state);
                        request.then(count => sendResponse({ result: 'ok', data: count }))
                            .catch(e => sendResponse({ result: 'fail', data: e }));
                    }
                    else if (type === 'feed') {
                        db.getItemsCountByFeedId(id, state)
                            .then(count => sendResponse({ result: 'ok', data: count }))
                            .catch(e => sendResponse({ result: 'fail', data: e }));
                    }
                    break;
                }
                case 'modify': {
                    let { ids, keyValues } = data;
                    db.updateItems(ids, keyValues)
                        .then(() => sendResponse({ result: 'ok' }))
                        .catch(e => sendResponse({ result: 'fail', data: e }));
                    break;
                }
            }
            return true;
        });
    },
    send(payload) {
        browser.runtime.sendMessage(payload);
    },
    sendBackgroundUpdate() {
        this.send({ action: 'background update', data: { type: 'group', id: 'all' } });
    },
    sendBackgroundUpdateComplete(id, result) {
        message.send({ action: 'background update complete', data: { id, result } });
    }
};

export default message;