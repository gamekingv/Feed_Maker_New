
const message = {
    init() {
        browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log('Message from the background script: ' + request.test);
            sendResponse({ test: 'Response from browser action page' });
        });
    },
    send(payload) {
        browser.runtime.sendMessage(payload);
    }
};

export default message;