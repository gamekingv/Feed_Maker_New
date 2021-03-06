/*globals process*/

import Vue from 'vue';
import Vuex from 'vuex';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        groups: [],
        parsers: {},
        feedState: {},
        buttons: [],
        collections: [],
        settings: {
            itemsPerPage: 15,
            view: 'all',
            autoUpdate: true,
            autoUpdateFrequency: 15,
            detailsWidth: 900,
            maxThread: 5
        },
        active: {
            type: 'list',
            subType: 'group',
            id: 'all'
        },
        infoText: [],
        last: {
            time: -1,
            successTime: -1,
            success: true,
            message: ''
        },
    },
    getters,
    mutations,
    actions,
    strict: process.env.NODE_ENV !== 'production'
});

export default store;