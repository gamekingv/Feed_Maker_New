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
    async updateFeed({ id, feed }) {
        if (!feed) feed = await this.getFeed(id);
        let config = {
            method: feed.method,
            url: feed.url,
            timeout: feed.timeout * 1000
        }, unread;
        if (feed.method === 'post' && feed.body) {
            config.data = feed.body;
        }
        let result = await axios(config);
        if (feed.custom) {
            console.log(feed);
        }
        else {
            let { items } = await this.normalParser(result.data);
            let newItems = [];
            for (let item of items) {
                let newItem = {
                    title: item.title,
                    url: item.link,
                    content: item['content:encoded'] ? item['content:encoded'] : item.content,
                    pubDate: Date.parse(item.pubDate),
                    feedId: id,
                    groupId: feed.groupId
                };
                let author = item.author || item.creator;
                if (typeof author !== 'string') author = JSON.stringify(author);
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
            unread = await db.addItems(newItems);
        }
        message.sendBackgroundUpdateComplete(id, unread);
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
        try {
            let parser = new RSSParser();
            let result = await parser.parseString(data);
            return result;
        }
        catch (e) {
            throw e;
        }
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