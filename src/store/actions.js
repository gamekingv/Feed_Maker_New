const actions = {
    async loadGroups({ commit }) {
        let { groups } = await browser.storage.local.get('groups');
        if (groups) commit('updateGroups', groups);
    },
    updateGroups({ commit }, groups) {
        commit('updateGroups', groups);
        return browser.storage.local.set({ groups });
    },
    updateFeeds({ commit, state }, data) {
        commit('updateFeeds', data);
        return browser.storage.local.set({ groups: state.groups });
    }
};

export default actions;