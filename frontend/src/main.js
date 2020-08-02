import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import VueRouter from 'vue-router';
import Upload from './components/Upload';
import Home from './components/Home';
import Stats from './components/Stats';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: Home },
    { path: '/upload', component: Upload },
    { path: '/stats', component: Stats },
    { path: '/stats/:code', component: Stats }
  ]
});


Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app');
