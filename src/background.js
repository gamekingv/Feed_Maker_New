import message from './utils/background/message';
import database from './utils/background/db';
import crawler from './utils/background/crawler';

message.init();
database.init().then(() => crawler.autoUpdate()).then(() => message.isInitialized = true);

browser.browserAction.onClicked.addListener(() => browser.tabs.create({
    url: browser.extension.getURL('build/index.html')
}));