import Vue from 'vue';

const mutations = {
    setActive(state, { type, subType, id }) {
        state.active.type = type;
        state.active.subType = subType;
        state.active.id = id;
    },
    addGroup(state, data) {
        state.groups.push(data);
    },
    deleteGroup(state, data) {
        state.groups.splice(state.groups.findIndex(group => group.id === data.id), 1);
        for (let feed of data.feeds) {
            Vue.delete(state.feedState, feed.id);
        }
    },
    updateGroup(state, data) {
        let group = state.groups.find(group => group.id === data.id);
        group.active = data.active;
        group.name = data.name;
    },
    updateGroups(state, data) {
        state.groups = data;
    },
    addFeed(state, data) {
        state.groups.find(group => group.id === data.groupId).feeds.push(data);
        Vue.set(state.feedState, data.id, {
            unread: 0,
            isLoading: false
        });
    },
    deleteFeed(state, data) {
        let feeds = state.groups.find(group => group.id === data.groupId).feeds;
        feeds.splice(feeds.findIndex(feed => feed.id === data.id), 1);
        Vue.delete(state.feedState, data.id);
    },
    updateFeed(state, data) {
        let feeds = state.groups.find(group => group.id === data.groupId).feeds;
        feeds.splice(feeds.findIndex(feed => feed.id === data.id), 1, data);
    },
    updateFeeds(state, { groupId, feeds }) {
        state.groups.find(group => group.id === groupId).feeds = feeds;
    },
    setView(state, data) {
        state.settings.view = data;
    },
    updateFeedState(state, { id, isLoading, unread, errorMessage }) {
        if (!state.feedState[id]) {
            Vue.set(state.feedState, id, {
                unread: 0,
                isLoading: false,
                errorMessage: ''
            });
        }
        if (isLoading !== undefined) state.feedState[id].isLoading = isLoading;
        if (unread !== undefined) state.feedState[id].unread = unread;
        if (errorMessage !== undefined) state.feedState[id].errorMessage = errorMessage;
    },
    addParser(state, { id, parser }) {
        Vue.set(state.parsers, id, parser);
    },
    deleteParser(state, id) {
        Vue.delete(state.parsers, id);
    },
    updateParser(state, { id, parser }) {
        state.parsers[id] = parser;
    },
    updateParsers(state, data) {
        state.parsers = data;
    },
};

export default mutations;