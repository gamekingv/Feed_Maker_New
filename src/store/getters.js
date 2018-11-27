const getters = {
    activeTitle: (state, getters) => {
        let title = '';
        if (state.active.type === 'edit') {
            title += '编辑';
        }
        if (state.active.subType === 'feed') {
            title += getters.getFeed(state.active.id).name;
        }
        else if (state.active.subType === 'group') {
            if (state.active.id === 'collection') {
                title += '收藏';
            } else if (state.active.id === 'all') {
                title += '全部';
            } else {
                title += getters.getGroup(state.active.id).name;
            }
        }
        if (state.active.type === 'add') {
            title = '添加';
        }
        return title;
    },
    getFeed: (state) => (id) => {
        for (let group of state.groups) {
            let feed = group.feeds.find(feed => feed.id === id);
            if (feed) return feed;
        }
    },
    getGroup: (state) => (id) => {
        return state.groups.find(group => group.id === id);
    },
};

export default getters;