import Vue from 'vue';
import App from './views/App';
import router from './router';
import store from './store';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.css';

Vue.use(Vuetify);

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
});
