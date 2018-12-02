import axios from 'axios';

const crawler = {
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
    async updateFeed(id) {
        let feed = await this.getFeed(id),
            config = {
                method: feed.method,
                url: feed.url,
                timeout: feed.timeout * 1000
            };
        if (feed.method === 'post' && feed.body) {
            config.data = feed.body;
        }
        let result = await axios(config);
        let parsed = await this.normalParser(result.data);
        console.log(parsed.title);
    },
    async normalParser(data) {
        // try {
        //     let parser = new Parser();
        //     let result = await parser.parseString(data);
        //     return result;
        // }
        // catch (e) {
        //     console.error(e);
        // }
    }
};

export default crawler;