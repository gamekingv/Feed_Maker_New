import crawler from './crawler';
import db from './db';

const message = {
    isInitialized: false,
    init() {
        browser.runtime.onMessage.addListener(({ action, data }) => {
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
                    break;
                }
                case 'getItems': {
                    let { type, id, page, amount, state, active } = data;
                    if (type === 'group') {
                        return id === 'all' ? db.getAllItems(page, amount, state, active) : db.getItemsByGroupId(id, page, amount, state, active);
                    }
                    else if (type === 'feed') {
                        return db.getItemsByFeedId(id, page, amount, state, active);
                    }
                    break;
                }
                case 'getCount': {
                    let { type, id, state } = data;
                    if (type === 'group') {
                        return data.id === 'all' ? db.getAllItemsCount(state) : db.getItemsCountByGroupId(id, state);
                    }
                    else if (type === 'feed') {
                        return db.getItemsCountByFeedId(id, state);
                    }
                    break;
                }
                case 'modify': {
                    let { ids, keyValues } = data;
                    return db.updateItems(ids, keyValues);
                }
                case 'fetch source': {
                    return crawler.fetchSource(data.feed);
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
                        return result;
                    }
                    catch (e) {
                        let { type, id, message } = e, errorMessage;
                        if (type) {
                            if (type === 'step') {
                                errorMessage = `处理步骤${steps.findIndex(step => id === step.id) + 1}出错：\n${message}`;
                            }
                        }
                        else errorMessage = e.toString();
                        return errorMessage;
                    }
                }
                case 'delete feed': {
                    return db.getItemsByFeedId(data.id).then(items => Promise.resolve(items.map(item => item.id))).then(keys => db.deleteItems(keys));
                }
                case 'delete group': {
                    return db.getItemsByGroupId(data.id).then(items => Promise.resolve(items.map(item => item.id))).then(keys => db.deleteItems(keys));
                }
                case 'clear database': {
                    return db.clearDataBase();
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
            return;
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