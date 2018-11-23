const getters = {
    activeTitle: (state, getters) => {
        if (state.active.type === 'feed') {
            return getters.getFeed(state.active.id).name;
        }
        else if (state.active.type === 'group') {
            return getters.getGroup(state.active.id).name;
        }
        else if (state.active.type === 'other') {
            return state.otherTitle[state.active.id];
        }
    },
    getFeed: (state) => (id) => {
        for (let group of state.groups) {
            let feed = group.feeds.find(feed => feed.id === id);
            if (feed) return feed;
        }
    },
    getGroup: (state) => (id) => {
        return state.groups.find(group => group.id === id);
    },
};

export default getters;