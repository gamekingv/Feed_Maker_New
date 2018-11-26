const mutations = {
    setActive(state, { type, subType, id }) {
        state.active.type = type;
        state.active.subType = subType;
        state.active.id = id;
    },
    updateGroups(state, data) {
        state.groups = data;
    },
    updateFeeds(state, data) {
        state.groups.find(group => group.id === data.id).feeds = data.feeds;
    }
};

export default mutations;