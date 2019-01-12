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
                    let { type, id, page, amount, state, active } = data;
                    if (type === 'group') {
                        let request = id === 'all' ? db.getAllItems(page, amount, state, active) : db.getItemsByGroupId(id, page, amount, state, active);
                        request.then(items => sendResponse({ result: 'ok', data: items }))
                            .catch(e => sendResponse({ result: 'fail', data: e.toString() }));
                    }
                    else if (type === 'feed') {
                        db.getItemsByFeedId(id, page, amount, state, active)
                            .then(items => sendResponse({ result: 'ok', data: items }))
                            .catch(e => sendResponse({ result: 'fail', data: e.toString() }));
                    }
                    break;
                }
                case 'getCount': {
                    let { type, id, state } = data;
                    if (type === 'group') {
                        let request = data.id === 'all' ? db.getAllItemsCount(state) : db.getItemsCountByGroupId(id, state);
                        request.then(count => sendResponse({ result: 'ok', data: count }))
                            .catch(e => sendResponse({ result: 'fail', data: e.toString() }));
                    }
                    else if (type === 'feed') {
                        db.getItemsCountByFeedId(id, state)
                            .then(count => sendResponse({ result: 'ok', data: count }))
                            .catch(e => sendResponse({ result: 'fail', data: e.toString() }));
                    }
                    break;
                }
                case 'modify': {
                    let { ids, keyValues } = data;
                    db.updateItems(ids, keyValues)
                        .then(() => sendResponse({ result: 'ok' }))
                        .catch(e => sendResponse({ result: 'fail', data: e.toString() }));
                    break;
                }
                case 'fetch source': {
                    crawler.fetchSource(data.feed).then(response => sendResponse(response));
                    break;
                }
                case 'parse source': {
                    let { source, type, steps } = data, result;
                    try {
                        if (type === 'base') result = crawler.baseStepsParser(source, steps);
                        else result = crawler.stepGroupParser(source, steps);
                        if (steps[steps.length - 1].method === 'selector') {
                            if (steps[steps.length - 1].flags.some(flag => flag === 'g')) result = Array.from(result).map(item => item.outerHTML);
                            else if (type !== 'base') result = result.map(item => item.outerHTML);
                            else result = result.outerHTML;
                        }
                        sendResponse({ result: 'ok', data: result });
                    }
                    catch (e) {
                        let { type, id, message } = e, errorMessage;
                        if (type) {
                            if (type === 'step') {
                                errorMessage = `处理步骤${steps.findIndex(step => id === step.id) + 1}出错：\n${message}`;
                            }
                        }
                        else errorMessage = e.toString();
                        sendResponse({ result: 'fail', data: errorMessage });
                    }
                    break;
                }
                case 'delete feed': {
                    db.getItemsByFeedId(data.id).then(items => Promise.resolve(items.map(item => item.id)))
                        .then(keys => db.deleteItems(keys)).then(() => sendResponse({ result: 'ok' }))
                        .catch(e => sendResponse({ result: 'fail', data: e.toString() }));
                    break;
                }
                case 'delete group': {
                    db.getItemsByGroupId(data.id).then(items => Promise.resolve(items.map(item => item.id)))
                        .then(keys => db.deleteItems(keys)).then(() => sendResponse({ result: 'ok' }))
                        .catch(e => sendResponse({ result: 'fail', data: e.toString() }));
                    break;
                }
                case 'clear database': {
                    db.clearDataBase().then(() => sendResponse({ result: 'ok' })).catch(e => sendResponse({ result: 'fail', data: e.toString() }));
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
    },
    sendBackgroundUpdateFail(id, errorMessage) {
        message.send({ action: 'background update fail', data: { id, errorMessage } });
    }
};

export default message;