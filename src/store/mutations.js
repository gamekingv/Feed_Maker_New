const mutations = {
    setActive(state, data) {
        state.active.type = data.type;
        state.active.id = data.id;
    }
};

export default mutations;