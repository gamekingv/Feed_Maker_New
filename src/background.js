import message from './utils/background/message';
import db from './utils/background/db';
import crawler from './utils/background/crawler';

browser.browserAction.disable();

message.init();
db.init().then(() => db.updateBadgeText()).then(() => crawler.init())
    .then(() => message.Initialized()).then(() => browser.browserAction.enable());

browser.browserAction.onClicked.addListener(() => browser.tabs.create({
    url: browser.extension.getURL('build/index.html')
}));