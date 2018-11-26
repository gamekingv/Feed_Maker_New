import Vue from 'vue';
import Vuex from 'vuex';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        groups: [],
        builtInTitle: {
            all: '全部',
            collection: '收藏'
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
    strict: true
});
process;

export default store;