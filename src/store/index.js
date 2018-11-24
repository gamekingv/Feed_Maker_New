import Vue from 'vue';
import Vuex from 'vuex';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        groups: [
            {
                name: 'group1', id: '2', isActive: false, feeds: [
                    { name: 'Management', icon: 'people_outline', id: '6', groupId: '2' },
                    { name: 'Settings', icon: 'settings', id: '7', groupId: '2' },
                    { name: 'test', icon: 'settings', id: '8', groupId: '2' }
                ]
            },
            {
                name: 'group2', id: '3', isActive: false, feeds: [
                    { name: 'Management', icon: 'people_outline', id: '9', groupId: '3' },
                    { name: 'Settings', icon: 'settings', id: '10', groupId: '3' },
                ]
            },
            {
                name: 'group3', id: '4', isActive: false, feeds: [
                    { name: 'Management', icon: 'people_outline', id: '11', groupId: '4' },
                ]
            },
            {
                name: 'group4', id: '5', isActive: false, feeds: [
                    { name: 'Management', icon: 'people_outline', id: '12', groupId: '5' },
                    { name: 'Settings', icon: 'settings', id: '13', groupId: '5' },
                    { name: 'test', icon: 'settings', id: '14', groupId: '5' },
                ]
            }
        ],
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
    strict: process.env.NODE_ENV !== 'production'
});

export default store;