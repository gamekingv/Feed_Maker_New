import crawler from './crawler';
import db from './db';

let isInitialized = false, ports = {};

const message = {
    init() {
        browser.runtime.onConnect.addListener((port) => {
            if (Object.keys(ports).length > 0) port.postMessage({
                action: 'alert',
                data: {
                    message: '检测到打开了超过1个Feed Maker页面，请注意在本页面修改任何配置将可能导致数据错误。'
                }
            });
            ports[port.name] = port;
            port.onMessage.addListener(this.messageListener.bind(this));
            port.onDisconnect.addListener(({ name }) => delete ports[name]);
        });
    },
    Initialized() {
        isInitialized = true;
        this.send({ action: 'initialize complete' });
    },
    async messageListener({ mid, action, data }, { name }) {
        const sendResponse = this.sendResponse.bind(this, name, mid);
        try {
            switch (action) {
                case 'get initialize state': {
                    if (isInitialized) sendResponse(true);
                    else sendResponse(false);
                    break;
                }
                case 'update': {
                    let { type, id } = data;
                    if (type === 'group') {
                        if (id === 'all') {
                            await crawler.updateAll();
                        }
                        else {
                            await crawler.updateGroup(id);
                        }
                    }
                    else if (type === 'feed') {
                        await crawler.updateFeed({ id });
                    }
                    break;
                }
                case 'getItems': {
                    let { type, id, page, amount, state, active } = data;
                    if (type === 'group') {
                        if (id === 'all') sendResponse(await db.getAllItems(page, amount, state, active));
                        else sendResponse(await db.getItemsByGroupId(id, page, amount, state, active));
                    }
                    else if (type === 'feed') {
                        sendResponse(await db.getItemsByFeedId(id, page, amount, state, active));
                    }
                    break;
                }
                case 'getCount': {
                    let { type, id, state } = data;
                    if (type === 'group') {
                        if (id === 'all') sendResponse(await db.getAllItemsCount(state));
                        else sendResponse(await db.getItemsCountByGroupId(id, state));
                    }
                    else if (type === 'feed') {
                        sendResponse(await db.getItemsCountByFeedId(id, state));
                    }
                    break;
                }
                case 'modify': {
                    let { ids, keyValues } = data;
                    sendResponse(await db.updateItems(ids, keyValues));
                    break;
                }
                case 'fetch source': {
                    sendResponse(await crawler.fetchSource(data.feed));
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
                        sendResponse(result);
                    }
                    catch (e) {
                        let { type, id, message } = e, errorMessage;
                        if (type) {
                            if (type === 'step') {
                                errorMessage = `处理步骤${steps.findIndex(step => id === step.id) + 1}出错：\n${message}`;
                            }
                        }
                        else errorMessage = e.toString();
                        sendResponse(errorMessage);
                    }
                    break;
                }
                case 'delete feed': {
                    sendResponse(await db.getItemsByFeedId(data.id).then(items => Promise.resolve(items.map(item => item.id))).then(keys => db.deleteItems(keys)));
                    break;
                }
                case 'delete group': {
                    sendResponse(await db.getItemsByGroupId(data.id).then(items => Promise.resolve(items.map(item => item.id))).then(keys => db.deleteItems(keys)));
                    break;
                }
                case 'clear database': {
                    sendResponse(await db.clearDataBase());
                    break;
                }
                case 'change autoUpdate': {
                    let { state } = data;
                    if (state) crawler.autoUpdate();
                    else crawler.stopUpdate();
                    break;
                }
                case 'change autoUpdateFrequency': {
                    crawler.stopUpdate();
                    crawler.autoUpdate();
                    break;
                }
            }
        }
        catch (e) {
            sendResponse(e.toString(), 'fail');
        }
    },
    send(payload) {
        Object.values(ports).forEach(port => port.postMessage(payload));
    },
    sendResponse(name, mid, data, state = 'ok') {
        ports[name].postMessage({ mid, action: 'response', data, state });
    },
    sendBackgroundUpdate() {
        this.send({ action: 'background update', data: { type: 'group', id: 'all' } });
    },
    sendBackgroundUpdateComplete(id, result) {
        this.send({ action: 'background update complete', data: { id, result } });
    },
    sendBackgroundUpdateFail(id, errorMessage) {
        this.send({ action: 'background update fail', data: { id, errorMessage } });
    }
};

export default message;