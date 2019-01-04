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
    async deleteGroup({ dispatch, commit }, group) {
        commit('deleteGroup', group);
        return await dispatch('saveGroups');
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
    async updateFeed({ dispatch, commit, getters }, feed) {
        let oldFeed = getters.getFeed(feed.id);
        if (feed.groupId !== oldFeed.groupId) {
            let items = await message.sendGet('feed', feed.id),
                ids = items.map(item => item.id);
            await message.sendModifyItems(ids, { groupId: feed.groupId });
            commit('updateFeed', { newFeed: feed, oldFeed });
        }
        else commit('updateFeed', { newFeed: feed });
        return await dispatch('saveGroups');
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
    updateParsers({ dispatch, commit }, data) {
        commit('updateParsers', data);
        return dispatch('saveParsers');
    },
};

export default actions;