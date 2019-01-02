import axios from 'axios';
import RSSParser from './rss-parser';
import db from './db';
import message from './message';

const crawler = {
    timer: null,
    queue: [],
    async getFeed(id) {
        let { groups } = await browser.storage.local.get('groups');
        for (let group of groups) {
            let feed = group.feeds.find(feed => feed.id === id);
            if (feed) return feed;
        }
    },
    async getGroup(id) {
        let { groups } = await browser.storage.local.get('groups');
        return groups.find(group => group.id === id);
    },
    async getParser(id) {
        let { parsers } = await browser.storage.local.get('parsers');
        return parsers[id];
    },
    async fetchSource(feed) {
        function modifyHeader(details) {
            browser.webRequest.onBeforeSendHeaders.removeListener(modifyHeader);
            for (let name in feed.headers) {
                let gotName = false;
                for (let requestHeader of details.requestHeaders) {
                    gotName = requestHeader.name.toLowerCase() === name;
                    if (gotName) {
                        requestHeader.value = feed.headers[name];
                    }
                }
                if (!gotName) {
                    details.requestHeaders.push({ name: name, value: feed.headers[name] });
                }
            }
            return { requestHeaders: details.requestHeaders };
        }
        browser.webRequest.onBeforeSendHeaders.addListener(modifyHeader, { urls: [feed.url] }, ['blocking', 'requestHeaders']);

        let config = {
            method: feed.method,
            url: feed.url,
            timeout: feed.timeout * 1000
        };
        if (feed.method === 'post' && feed.body) {
            config.data = feed.body;
        }
        try {
            let response = await axios(config);
            return { result: 'ok', data: response.data };
        }
        catch (e) {
            return { result: 'fail', data: e.toString() };
        }
    },
    async updateFeed({ id, feed }) {
        if (!feed) feed = await this.getFeed(id);
        let { result, data } = await this.fetchSource(feed), unread, newItems;
        if (result === 'fail') {
            message.sendBackgroundUpdateFail(id, data);
            return;
        }
        try {
            if (feed.custom) {
                let parserGroups = await this.getParser(id);
                newItems = this.customParser(data, parserGroups).map(item => {
                    item.feedId = id;
                    item.groupId = feed.groupId;
                    return item;
                });
            }
            else {
                let { items } = await this.normalParser(data);
                newItems = [];
                for (let item of items) {
                    let newItem = {
                        title: item.title,
                        url: item.link,
                        content: item['content:encoded'] ? item['content:encoded'] : item.content,
                        pubDate: new Date(item.pubDate).getTime(),
                        feedId: id,
                        groupId: feed.groupId
                    };
                    let author = item.author || item.creator;
                    newItem.author = author;
                    if (item.enclosure) {
                        let { type, url } = item.enclosure;
                        if (type.indexOf('video') > -1) {
                            newItem.content += `<br /><div><video controls src="${url}" /></div>`;
                        }
                        else if (type.indexOf('audio') > -1) {
                            newItem.content += `<br /><div><audio src="${url}" /></div>`;
                        }
                        else if (type.indexOf('image') > -1) {
                            newItem.content += `<br /><div><img src="${url}" /></div>`;
                        }
                        else {
                            newItem.content += `<br /><div><a href="${url}">File</a></div>`;
                        }
                    }
                    newItems.push(newItem);
                }
            }
            unread = await db.addItems(newItems);
            message.sendBackgroundUpdateComplete(id, unread);
        }
        catch (e) {
            message.sendBackgroundUpdateFail(id, e.toString());
        }
    },
    async updateGroup(id) {
        let group = await this.getGroup(id);
        group.feeds.forEach(feed => this.updateFeed(feed));
    },
    async updateAll() {
        let { groups } = await browser.storage.local.get('groups');
        groups.reduce((total, group) => total.concat(group.feeds), []).forEach(feed => this.updateFeed(feed));
    },
    async normalParser(data) {
        let parser = new RSSParser();
        let result = await parser.parseString(data);
        return result;
    },
    customParser(source, parserGroups) {
        let baseResults = parserGroups.map(parserGroup => this.baseStepsParser(source, parserGroup.base[0].parserSteps)),
            bufferResultsIndex = parserGroups.map(parserGroup => this.getBufferIndex(parserGroup)),
            bufferResults = parserGroups.map((parserGroup, index) => this.commonStepsParser(baseResults[index], parserGroup.common, bufferResultsIndex[index])),
            titleResults = this.resultStepsParser(parserGroups, bufferResults, 'title', '标题'),
            urlResults = this.resultStepsParser(parserGroups, bufferResults, 'url', '链接'),
            authorResults = this.resultStepsParser(parserGroups, bufferResults, 'author', '作者'),
            pubDateResults = this.resultStepsParser(parserGroups, bufferResults, 'pubDate', '时间'),
            contentResults = this.resultStepsParser(parserGroups, bufferResults, 'content', '内容'),
            isEqual = [titleResults, urlResults, authorResults, pubDateResults, contentResults].every(({ length }, i, arr) => length === 0 || arr[0].length === length);
        if (isEqual === false) {
            throw `并非所有处理组的元素数量相等（数量为0将被忽略）：\n标题：${titleResults.length}；链接：${urlResults.length}；作者：${authorResults.length}；时间：${pubDateResults.length}；内容：${contentResults.length}；`;
        }
        let date = new Date(), today = {
            year: `${date.getFullYear()}`,
            month: ('0' + (date.getMonth() + 1)).substr(-2),
            day: ('0' + date.getDate()).substr(-2),
            hour: ('0' + date.getHours()).substr(-2),
            minute: ('0' + date.getMinutes()).substr(-2),
            second: ('0' + date.getSeconds()).substr(-2),
        };
        pubDateResults = pubDateResults.map(result => this.pubDateParser(result, today));
        return titleResults.map((titleResult, index) => ({
            title: titleResult,
            url: urlResults[index],
            content: contentResults[index],
            pubDate: pubDateResults[index],
            author: authorResults[index]
        }));
    },
    getBufferIndex(parserGroup) {
        return Object.values(parserGroup).reduce((result, parsers) => Object.assign(result, parsers.reduce((result, parser) => {
            if (parser.source && parser.source !== 'base' && parser.source !== 'origin') result[parser.source] = true;
            return result;
        }, {})), {});
    },
    baseStepsParser(source, steps) {
        return steps.reduce((result, step, index) => this.stepParser(result, step, steps[index - 1] && steps[index - 1].method), source);
    },
    commonStepsParser(baseResults, parsers, bufferResultIndex) {
        let results = { base: baseResults };
        parsers.forEach((parser, parserIndex) => {
            let { source, parserSteps } = parser, sources = results[source];
            parserSteps.forEach((step, index) => {
                let stepName = `common${parserIndex + 1}Step${index + 1}`;
                if (bufferResultIndex[stepName])
                    results[stepName] = sources.map(source => this.stepParser(source, step, parserSteps[index - 1] && parserSteps[index - 1].method));
            });
        }
        );
        return results;
    },
    resultStepsParser(parserGroups, bufferResults, parserId, parsersName) {
        return parserGroups.map((parserGroup, index) =>
            parserGroup[parserId].map(parser => parser.source ? this.stepGroupParser(bufferResults[index][parser.source], parser.parserSteps) : []).reduce((results, groupResults, index) => {
                if (results.length !== groupResults.length) throw `${parsersName}组 (${index + 1}) 的元素数量与之前${parsersName}组的元素数量不相等`;
                else return results.map((result, index) => result += groupResults[index]);
            })
        ).reduce((total, result) => total.concat(result), []);
    },
    stepGroupParser(sources, steps) {
        return sources.map(source => this.baseStepsParser(source, steps));
    },
    stepParser(source, step, lastMethod) {
        if (!source) return '';
        try {
            let result = '',
                { method, regexp, flags, replaceExp, subPattern } = step,
                isGlobal = flags.some(flag => flag === 'g');
            switch (method) {
                case 'match':
                case 'replace': {
                    if (typeof source === 'string') result = source;
                    else if (source instanceof HTMLElement) result = source.outerHTML;
                    else if (Number(source)) result = source.toString();
                    else if (typeof source === 'object') result = JSON.stringify(source);
                    else throw `无法处理此输入源“${source}”`;
                    let mode = 'm' + flags.join(''),
                        subs, matches = [],
                        pattern = new RegExp(regexp, mode);
                    if (method === 'replace') result = result.replace(pattern, replaceExp);
                    else if (method === 'match' && !isGlobal) result = result.match(pattern);
                    else {
                        while ((subs = pattern.exec(result)) !== null) {
                            matches.push(subs);
                        }
                        result = matches;
                    }
                    break;
                }
                case 'json': {
                    if (typeof source === 'string') result = JSON.parse(source);
                    else if (typeof source === 'object') result = source;
                    else throw `无法处理此输入源“${source}”`;
                    result = regexp.split('.').reduce((target, propertyName) => target = target[propertyName], result);
                    break;
                }
                case 'selector': {
                    let dom;
                    if (lastMethod == 'selector') dom = source;
                    else {
                        if (typeof source === 'string') result = source;
                        else if (typeof source === 'object') result = JSON.stringify(source);
                        else throw `无法处理此输入源“${source}”`;
                        dom = document.createElement('body');
                        dom.innerHTML = result;
                    }
                    if (isGlobal) result = dom.querySelectorAll(regexp);
                    else result = dom.querySelector(regexp);
                    break;
                }
            }
            if (subPattern) return result[subPattern];
            else return result;
        }
        catch (e) {
            throw { type: 'step', id: step.id, message: e };
        }
    },
    pubDateParser(pubDate, today) {
        pubDate = pubDate.replace('yyyy', today.year).replace('MM', today.month).replace('dd', today.day)
            .replace('HH', today.hour).replace('mm', today.minute).replace('ss', today.second);
        let result = new Date(Number(pubDate) ? Number(pubDate) : pubDate).getTime();
        if (isNaN(result)) throw `时间组中存在无法转换为Date对象的字符串：${pubDate}`;
        else return result;
    },
    async autoUpdate() {
        return;
        // let frequency = 0.5;
        // this.timer = setInterval(() => {
        //     message.sendBackgroundUpdate();
        //     this.updateAll();
        // }, frequency * 60 * 1000);
    },
    stopUpdate() {
        clearInterval(this.timer);
        this.timer = null;
    }
};

export default crawler;