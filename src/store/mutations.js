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
            isLoading: false,
            errorMessage: ''
        });
    },
    deleteFeed(state, data) {
        let feeds = state.groups.find(group => group.id === data.groupId).feeds;
        feeds.splice(feeds.findIndex(feed => feed.id === data.id), 1);
        Vue.delete(state.feedState, data.id);
        state.buttons.forEach(button => {
            let index = button.feedIds.indexOf(data.id);
            if (index > -1) {
                button.feedIds.splice(index, 1);
            }
        });
    },
    updateFeed(state, { newFeed, oldFeed }) {
        if (oldFeed) {
            let oldFeeds = state.groups.find(group => group.id === oldFeed.groupId).feeds;
            oldFeeds.splice(oldFeeds.findIndex(feed => feed.id === oldFeed.id), 1);
            state.groups.find(group => group.id === newFeed.groupId).feeds.push(newFeed);
        }
        else {
            let feeds = state.groups.find(group => group.id === newFeed.groupId).feeds;
            feeds.splice(feeds.findIndex(feed => feed.id === newFeed.id), 1, newFeed);
        }
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
    deleteParser(state, data) {
        Vue.delete(state.parsers, data);
    },
    updateParser(state, { id, parser }) {
        state.parsers[id] = parser;
    },
    updateParsers(state, data) {
        state.parsers = data;
    },
    addButton(state, data) {
        state.buttons.push(data);
    },
    deleteButton(state, data) {
        state.buttons.splice(state.buttons.findIndex(button => button.id === data.id), 1);
    },
    updateButton(state, data) {
        state.buttons.splice(state.buttons.findIndex(button => button.id === data.id), 1, data);
    },
    updateButtonState(state, { id, active }) {
        state.buttons.find(button => button.id === id).active = active;
    },
    updateButtons(state, data) {
        state.buttons = data;
    },
    changeSetting(state, data) {
        let [key, value] = Object.entries(data)[0];
        state.settings[key] = value;
    },
    updateSettings(state, data) {
        Object.keys(data).forEach(key => state.settings[key] = data[key]);
    },
    addCollection(state, data) {
        state.collections.push(data);
    },
    deleteCollection(state, data) {
        state.collections.splice(state.collections.findIndex(collection => collection.id === data), 1);
    },
    updateCollections(state, data) {
        state.collections = data;
    },
    addInfoText(state, data) {
        state.infoText.push(data);
    },
    deleteInfoText(state, data) {
        state.infoText.splice(state.infoText.findIndex(text => text.id === data), 1);
    }
};

export default mutations;