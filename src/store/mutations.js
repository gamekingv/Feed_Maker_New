const mutations = {
    setActive(state, data) {
        state.active.type = data.type;
        state.active.subType = data.subType;
        state.active.id = data.id;
    },
    updateGroups(state, data) {
        state.groups = data;
    },
    updateFeeds(state, data) {
        state.groups.find(group => group.id === data.id).feeds = data.feeds;
    }
};

export default mutations;