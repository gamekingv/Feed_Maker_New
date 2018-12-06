import Vue from 'vue';
import App from './views/App';
import store from './store';
import router from './router';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.css';
import message from './utils/extension/message';

message.init();

Vue.use(Vuetify);

new Vue({
    el: '#app',
    store,
    router,
    render: h => h(App)
});

// Vue.config.errorHandler = (error, vm) => console.error('抛出全局异常', vm, error);