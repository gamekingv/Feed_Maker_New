import Vue from 'vue';
import Router from 'vue-router';
import store from '~/store';

Vue.use(Router);

const router = new Router({
    mode: 'hash',
    routes: [
        {
            path: '/',
            redirect: '/list/group/all'
        },
        {
            path: '/list/:type/:id',
            component: () => import('views/ItemList'),
            name: 'itemList'
        },
        {
            path: '/add',
            component: () => import('views/Edit'),
            name: 'add'
        },
        {
            path: '/edit/:editType/:editId',
            component: () => import('views/Edit'),
            props: true,
            name: 'edit'
        },
        {
            path: '/button/list',
            component: () => import('views/Button'),
            name: 'buttonList'
        },
        {
            path: '*',
            redirect: '/list/group/all'
        }
    ]
});

router.beforeEach((to, from, next) => {
    let [type, subType, id] = to.path.substr(1).split('/');
    store.commit('setActive', { type, subType, id });
    next();
});

export default router;