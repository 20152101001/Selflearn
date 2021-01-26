import Vue from 'vue';
import App from './App';
import router from './router';
import VueResource from 'vue-resource';

import './common/stylus/index.styl';

Vue.config.productionTip = false;
Vue.use(VueResource);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});
