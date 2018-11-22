import Vue from 'vue';
import Router from 'vue-router';
import ItemList from './views/ItemList/index';
import Arrange from './views/Arrange/index';

Vue.use(Router);

const router = new Router({
    mode: 'hash',
    routes: [
        {
            path: '/',
            component: ItemList,
            name: 'itemList'
        },
        {
            path: '/arrange',
            component: Arrange,
            name: 'arrange'
        }
    ]
});

export default router;