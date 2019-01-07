import Vue from 'vue';
import App from './views/App';
import store from './store';
import router from './router';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import Vuetify from 'vuetify';
import VueScrollTo from 'vue-scrollto';
import LazyRender from 'vue-lazy-render';
import 'vuetify/dist/vuetify.css';
import './main.css';

Vue.use(Vuetify);
Vue.use(VueScrollTo);
Vue.use(LazyRender);

new Vue({
    el: '#app',
    store,
    router,
    render: h => h(App)
});

Vue.config.errorHandler = (error, vm) => console.error('抛出全局异常', vm, error);