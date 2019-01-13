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

const errorHandler = (error) => {
    store.dispatch('addInfoText', { id: Date.now().toString(), text: '出现未知错误，请按F12打开控制台查看。', color: 'error' });
    console.error('Feed Maker扩展未知错误：', error);
    return true;
};

Vue.config.errorHandler = errorHandler;
Vue.throw = errorHandler;
Vue.prototype.$throw = errorHandler;
onerror = errorHandler;
