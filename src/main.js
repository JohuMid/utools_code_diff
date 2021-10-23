import Vue from 'vue'
import App from './App.vue'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router/index'

import "@/assets/gulptheme/FEB84A/index.css"; // 换肤版本 FEB84A css
import "@/assets/gulptheme/08E6B9/index.css"; // 换肤版本 08E6B9 css

Vue.use(Element)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
