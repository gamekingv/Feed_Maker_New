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
                case 'get': {
                    if (data.type === 'group') {
                        console.log(data.id);
                    }
                    else if (data.type === 'feed') {
                        db.getItemsByFeedId(data.id)
                            .then(items => sendResponse({ result: 'ok', data: items }))
                            .catch(e => sendResponse({ result: 'fail', data: e }));
                    }
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