import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const router = new Router({
    mode: 'hash',
    routes: [
        {
            path: '/',
            redirect: '/feed/all'
        },
        {
            path: '/feed/:id',
            component: () => import('views/ItemList/index'),
            props: true,
            name: 'itemList'
        },
        {
            path: '/arrange',
            component: () => import('views/Arrange/index'),
            name: 'arrange'
        }
    ]
});

export default router;