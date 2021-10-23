import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
import EditorDiff from "./../components/EditorDiff";
const routes = [
  {
    path: '/',
    name: 'EditorDiff',
    component: EditorDiff
  }
]

const router = new VueRouter({
  routes
})

export default router
