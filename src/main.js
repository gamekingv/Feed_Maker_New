import Vue from 'vue';
import App from './views/App';
import router from './router';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.css';

Vue.use(Vuetify);

new Vue({
    el: '#app',
    router,
    render: h => h(App)
});
