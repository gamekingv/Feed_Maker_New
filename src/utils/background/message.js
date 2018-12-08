import crawler from './crawler';
import db from './db';

const message = {
    isInitialized: false,
    init() {
        browser.runtime.onMessage.addListener(({ action, data }, sender, sendResponse) => {
            switch (action) {
                case 'update': {
                    if (data.type === 'group') {
                        console.log(data.id);
                    }
                    else if (data.type === 'feed') {
                        crawler.updateFeed(data.id)
                            .then(() => sendResponse({ result: 'ok' }))
                            .catch(e => sendResponse({ result: 'fail', data: e }));
                    }
                    break;
                }
                case 'getItems': {
                    if (data.type === 'group') {
                        let request = data.id === 'all' ? db.getAllItems(data.page, data.amount) : db.getItemsByGroupId(data.id, data.page, data.amount);
                        request.then(items => sendResponse({ result: 'ok', data: items }))
                            .catch(e => sendResponse({ result: 'fail', data: e }));
                    }
                    else if (data.type === 'feed') {
                        db.getItemsByFeedId(data.id, data.page, data.amount)
                            .then(items => sendResponse({ result: 'ok', data: items }))
                            .catch(e => sendResponse({ result: 'fail', data: e }));
                    }
                    break;
                }
                case 'getCount': {
                    if (data.type === 'group') {
                        let request = data.id === 'all' ? db.getAllItemsCount() : db.getItemsCountByGroupId(data.id);
                        request.then(count => sendResponse({ result: 'ok', data: count }))
                            .catch(e => sendResponse({ result: 'fail', data: e }));
                    }
                    else if (data.type === 'feed') {
                        db.getItemsCountByFeedId(data.id)
                            .then(count => sendResponse({ result: 'ok', data: count }))
                            .catch(e => sendResponse({ result: 'fail', data: e }));
                    }
                    break;
                }
                case 'modify': {
                    db.updateItems(data.ids, data.keyValues)
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
    }
};

export default message;