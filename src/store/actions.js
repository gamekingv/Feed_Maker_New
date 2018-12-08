const actions = {
    async getGroups({ commit }) {
        let { groups } = await browser.storage.local.get('groups');
        if (groups) commit('updateGroups', groups);
    },
    saveGroups({ state }) {
        return browser.storage.local.set({ groups: state.groups });
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
    }
};

export default actions;