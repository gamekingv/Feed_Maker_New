import Vue from 'vue';
import Vuex from 'vuex';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        groups: [],
        settings: {
            itemsPerPage: 15
        },
        active: {
            type: 'list',
            subType: 'group',
            id: 'all'
        },
    },
    getters,
    mutations,
    actions,
    strict: process.env.NODE_ENV !== 'production'
});

export default store;