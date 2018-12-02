import message from './utils/background/message';
import database from './utils/background/db';

message.init();
database.init().then(() => message.isInitialized = true);

browser.browserAction.onClicked.addListener(() => browser.tabs.create({
    url: browser.extension.getURL('build/index.html')
}));