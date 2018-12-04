const mutations = {
    setActive(state, { type, subType, id }) {
        state.active.type = type;
        state.active.subType = subType;
        state.active.id = id;
    },
    refreshList(state, data) {
        state.list = data;
    },
    addGroup(state, data) {
        state.groups.push(data);
    },
    deleteGroup(state, data) {
        state.groups.splice(state.groups.findIndex(group => group.id === data.id), 1);
    },
    updateGroup(state, data) {
        state.groups.splice(state.groups.findIndex(group => group.id === data.id), 1, data);
    },
    updateGroups(state, data) {
        state.groups = data;
    },
    addFeed(state, data) {
        state.groups.find(group => group.id === data.groupId).feeds.push(data);
    },
    deleteFeed(state, data) {
        let feeds = state.groups.find(group => group.id === data.groupId).feeds;
        feeds.splice(feeds.findIndex(feed => feed.id === data.id), 1);
    },
    updateFeed(state, data) {
        let feeds = state.groups.find(group => group.id === data.groupId).feeds;
        feeds.splice(feeds.findIndex(feed => feed.id === data.id), 1, data);
    },
    updateFeeds(state, { groupId, feeds }) {
        state.groups.find(group => group.id === groupId).feeds = feeds;
    }
};

export default mutations;