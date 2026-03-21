import { createRouter, createWebHistory } from 'vue-router'
import HomeComponent from './components/HomeComponent.vue'
import ProductDetail from './components/ProductDetail.vue'

const routes = [
  {
    path: '/',
    component: HomeComponent
  },
  {
    path: '/product/:id',
    component: ProductDetail,
    meta: { hideBanner: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router