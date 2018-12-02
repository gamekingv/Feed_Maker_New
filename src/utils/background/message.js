import crawler from './crawler';

const message = {
    isInitialized: false,
    init() {
        browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'update':
                    browser.storage.local.get('groups').then(({ groups }) => {
                        if (request.message.type === 'group') {
                            console.log(request.message.id);
                        }
                        else if (request.message.type === 'feed') {
                            crawler.updateFeed(request.message.id);
                        }
                    });
                    break;
            }
            // sendResponse({ test: 'Response from background script' });
        });
    },
    send(payload) {
        browser.runtime.sendMessage(payload);
    }
};

export default message;