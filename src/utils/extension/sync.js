import axios from 'axios';

let syncTimer, app, storage = browser.storage.local;

async function fetchSource(feed) {
    let config = {
        method: feed.method,
        url: feed.url,
        timeout: (feed.timeout ? feed.timeout : 30) * 1000,
        transformResponse: res => res
    };
    if ((feed.method === 'post' || feed.method === 'put') && feed.body) {
        config.data = feed.body;
    }
    try {
        let response = await axios(config);
        return { result: 'ok', data: response.data };
    }
    catch (e) {
        return { result: 'fail', data: e.toString() };
    }
}

const sync = {
    init(vm) {
        app = vm;
        this.autoSync();
    },
    async synchronize(isForced) {
        let config = await storage.get(),
            content = btoa(encodeURIComponent(JSON.stringify(config))),
            link = config.synchronization.link,
            token = config.synchronization.token,
            lastSuccessTime = config.last ? config.last.successTime : -1,
            timeStamp = Date.now(),
            configLink = `https://api.github.com/repos/${link}/contents/config.json?access_token=${token}`,
            repositoryLink = `https://api.github.com/repos/${link}?access_token=${token}`,
            commitsLink = `https://api.github.com/repos/${link}/commits/master?access_token=${token}`,
            body = {
                message: `${new Date(timeStamp).toLocaleString()}(${timeStamp})`,
                content
            };
        let { result, data } = await fetchSource({
            method: 'get',
            url: configLink
        });
        if (result === 'fail' && data.indexOf('404') > 0) {
            let response = await fetchSource({
                method: 'get',
                url: repositoryLink
            });
            if (response.result === 'fail' && response.data.indexOf('404') > 0) {
                return await storage.set({
                    last: {
                        time: timeStamp,
                        successTime: lastSuccessTime,
                        success: false,
                        message: '仓库不存在'
                    }
                });
            }
        }
        else if (result === 'ok') {
            let response = await fetchSource({
                method: 'get',
                url: commitsLink
            });
            if (response.result === 'ok') {
                let dateString = JSON.parse(response.data).commit.message,
                    remoteSuccessTime = parseInt(dateString.match(/\((.*)\)/)[1]);
                if (isForced || (config.last && config.last.successTime >= remoteSuccessTime)) {
                    let { sha } = JSON.parse(data);
                    body.sha = sha;
                }
                else {
                    let newConfigResponse = await fetchSource({
                        method: 'get',
                        url: JSON.parse(data).download_url
                    });
                    if (newConfigResponse.result === 'ok') {
                        let newConfig = JSON.parse(decodeURIComponent(newConfigResponse.data));
                        app.newConfigDetected(newConfig);
                        return;
                    }
                    else {
                        return await storage.set({
                            last: {
                                time: timeStamp,
                                successTime: lastSuccessTime,
                                success: false,
                                message: '检测到有更新的配置，但下载失败'
                            }
                        });
                    }
                }
            }
            else {
                return await storage.set({
                    last: {
                        time: timeStamp,
                        successTime: lastSuccessTime,
                        success: false,
                        message: '获取上一次提交信息失败'
                    }
                });
            }
        }
        else {
            return await storage.set({
                last: {
                    time: timeStamp,
                    successTime: lastSuccessTime,
                    success: false,
                    message: data
                }
            });
        }

        let response = await fetchSource({
            method: 'put',
            url: configLink,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (response.result === 'ok') {
            return await storage.set({
                last: {
                    time: timeStamp,
                    successTime: timeStamp,
                    success: true,
                    message: ''
                }
            });
        }
        else {
            return await storage.set({
                last: {
                    time: timeStamp,
                    successTime: lastSuccessTime,
                    success: false,
                    message: response.data
                }
            });
        }
    },
    async autoSync() {
        let { last, synchronization } = await storage.get(['last', 'synchronization']);
        if (synchronization && synchronization.isAutoSync) {
            let frequency = {
                hourly: 1,
                daily: 24,
                weekly: 7 * 24
            }, interval = frequency[synchronization.frequency] * 60 * 60 * 1000;
            if (!last || last && (Date.now() - last.time > interval)) {
                await this.synchronize();
                app.updateLast();
                syncTimer = setInterval(async () => {
                    await this.synchronize();
                    app.updateLast();
                }, interval);
            }
            else {
                setTimeout(async () => {
                    await this.synchronize();
                    app.updateLast();
                    syncTimer = setInterval(async () => {
                        await this.synchronize();
                        app.updateLast();
                    }, interval);
                }, interval - (Date.now() - last.time));
            }
        }
    },
    stopSync() {
        if (syncTimer !== undefined) {
            clearInterval(syncTimer);
            syncTimer = undefined;
        }
    }
};

export default sync;