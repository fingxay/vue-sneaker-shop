import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/client/HomeView.vue'
import CartView from '@/views/client/CartView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router