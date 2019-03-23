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
        let { buttons } = await browser.storage.local.get('buttons');
        if (buttons) commit('updateButtons', buttons);
        let { settings } = await browser.storage.local.get('settings');
        if (settings) commit('updateSettings', settings);
        let { collections } = await browser.storage.local.get('collections');
        if (collections) commit('updateCollections', collections);
    },
    saveGroups({ state }) {
        let groups = JSON.parse(JSON.stringify(state.groups));
        return browser.storage.local.set({ groups });
    },
    saveParsers({ state }) {
        let parsers = JSON.parse(JSON.stringify(state.parsers));
        return browser.storage.local.set({ parsers });
    },
    saveButtons({ state }) {
        let buttons = JSON.parse(JSON.stringify(state.buttons));
        return browser.storage.local.set({ buttons });
    },
    saveSettings({ state }) {
        let settings = JSON.parse(JSON.stringify(state.settings));
        return browser.storage.local.set({ settings });
    },
    saveCollections({ state }) {
        let collections = JSON.parse(JSON.stringify(state.collections));
        return browser.storage.local.set({ collections });
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
    async deleteFeed({ dispatch, commit }, feed) {
        commit('deleteFeed', feed);
        await dispatch('saveButtons');
        return await dispatch('saveGroups');
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
    addButton({ dispatch, commit }, data) {
        commit('addButton', data);
        return dispatch('saveButtons');
    },
    deleteButton({ dispatch, commit }, data) {
        commit('deleteButton', data);
        return dispatch('saveButtons');
    },
    updateButton({ dispatch, commit }, data) {
        commit('updateButton', data);
        return dispatch('saveButtons');
    },
    updateButtonState({ dispatch, commit }, data) {
        commit('updateButtonState', data);
        return dispatch('saveButtons');
    },
    updateButtons({ dispatch, commit }, data) {
        commit('updateButtons', data);
        return dispatch('saveButtons');
    },
    changeSetting({ commit }, data) {
        commit('changeSetting', data);
    },
    updateSetting({ dispatch, commit }, data) {
        commit('changeSetting', data);
        return dispatch('saveSettings');
    },
    updateSettings({ dispatch, commit }, data) {
        commit('updateSettings', data);
        return dispatch('saveSettings');
    },
    addCollection({ dispatch, commit }, data) {
        commit('addCollection', data);
        return dispatch('saveCollections');
    },
    deleteCollection({ dispatch, commit }, data) {
        commit('deleteCollection', data);
        return dispatch('saveCollections');
    },
    addInfoText({ commit }, data) {
        commit('addInfoText', data);
    },
    deleteInfoText({ commit }, data) {
        commit('deleteInfoText', data);
    }
};

export default actions;