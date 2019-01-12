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
            if (state.active.id === 'collections') {
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
    getFeed: state => id => state.groups.reduce((feeds, group) => feeds.concat(group.feeds), []).find(feed => feed.id === id),
    getGroup: state => id => state.groups.find(group => group.id === id),
    getFeedUnread: (state) => ({ id }) => state.feedState[id].unread,
    getGroupUnread: (state, getters) => id => state.groups.find(group => group.id === id).feeds.reduce((total, feed) => getters.getFeedUnread(feed) + total, 0),
    getAllUnread: (state, getters) => state.groups.reduce((total, group) => getters.getGroupUnread(group.id) + total, 0),
    getGroupLoading: state => id => state.groups.find(group => group.id === id).feeds.some(feed => state.feedState[feed.id].isLoading === true),
    getFeedError: state => id => state.feedState[id].errorMessage,
    getGroupError: state => id => state.groups.find(group => group.id === id).feeds.some(feed => state.feedState[feed.id].errorMessage !== '')
};

export default getters;