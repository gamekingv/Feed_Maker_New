import message from '../utils/extension/message';

const actions = {
    async initStore({ commit }) {
        let { groups } = await browser.storage.local.get('groups');
        if (groups) {
            commit('updateGroups', groups);
            for (let group of groups) {
                for (let feed of group.feeds) {
                    let unread = await message.sendGetCount('feed', feed.id, 'unread');
                    commit('updateFeedState', { id: feed.id, unread });
                }
            }
        }
        let { parsers } = await browser.storage.local.get('parsers');
        if (parsers) commit('updateParsers', parsers);
    },
    saveGroups({ state }) {
        return browser.storage.local.set({ groups: state.groups });
    },
    saveParsers({ state }) {
        return browser.storage.local.set({ parsers: state.parsers });
    },
    addGroup({ dispatch, commit }, group) {
        group.feeds = [];
        commit('addGroup', group);
        return dispatch('saveGroups');
    },
    deleteGroup({ dispatch, commit }, group) {
        commit('deleteGroup', group);
        return dispatch('saveGroups');
    },
    updateGroup({ dispatch, commit }, group) {
        commit('updateGroup', group);
        return dispatch('saveGroups');
    },
    updateGroups({ dispatch, commit }, groups) {
        commit('updateGroups', groups);
        return dispatch('saveGroups');
    },
    addFeed({ dispatch, commit }, feed) {
        commit('addFeed', feed);
        return dispatch('saveGroups');
    },
    deleteFeed({ dispatch, commit }, feed) {
        commit('deleteFeed', feed);
        return dispatch('saveGroups');
    },
    updateFeed({ dispatch, commit }, feed) {
        commit('updateFeed', feed);
        return dispatch('saveGroups');
    },
    updateFeeds({ dispatch, commit }, data) {
        commit('updateFeeds', data);
        return dispatch('saveGroups');
    },
    setView({ commit }, data) {
        commit('setView', data);
    },
    updateFeedState({ commit }, data) {
        commit('updateFeedState', data);
    },
    addParser({ dispatch, commit }, data) {
        commit('addParser', data);
        return dispatch('saveParsers');
    },
    deleteParser({ dispatch, commit }, data) {
        commit('deleteParser', data);
        return dispatch('saveParsers');
    },
    updateParser({ dispatch, commit }, data) {
        commit('updateParser', data);
        return dispatch('saveParsers');
    },
};

export default actions;