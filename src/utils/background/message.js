import axios from 'axios';

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
                            let feed;
                            for (let group of groups) {
                                feed = group.feeds.find(feed => feed.id === request.message.id);
                                if (feed) break;
                            }
                            let config = {
                                method: feed.method,
                                url: feed.url,
                                timeout: feed.timeout * 1000
                            };
                            if (feed.method === 'post' && feed.body) {
                                config.data = feed.body;
                            }
                            axios(config).then(result => console.log(result.data));
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