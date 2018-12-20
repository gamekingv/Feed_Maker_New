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
        return state.groups.reduce((feeds, group) => feeds.concat(group.feeds), []).find(feed => feed.id === id);
    },
    getGroup: (state) => (id) => {
        return state.groups.find(group => group.id === id);
    },
    getGroupUnread: (state) => (id) => {
        return state.groups.find(group => group.id === id).feeds.reduce((total, feed) => state.feedState[feed.id].unread + total, 0);
    },
    getAllUnread: (state, getters) => {
        return state.groups.reduce((total, group) => getters.getGroupUnread(group.id) + total, 0);
    },
};

export default getters;