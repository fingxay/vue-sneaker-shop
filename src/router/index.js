import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/client/HomeView.vue'
import CartView from '@/views/client/CartView.vue'
import ProductDetailView from '@/views/client/ProductDetailView.vue'

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
  },
  {
    path: '/product/:id',
    name: 'product-detail',
    component: ProductDetailView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router