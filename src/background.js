browser.browserAction.onClicked.addListener(() => browser.tabs.create({
    url: browser.extension.getURL('build/index.html')
}));