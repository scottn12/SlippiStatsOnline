import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import theme from './theme';

Vue.config.devtools = false;
Vue.use(Vuetify);

export default new Vuetify({
  theme
});