import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/client/HomeView.vue'
import CartView from '@/views/client/CartView.vue'
import ProductDetailView from '@/views/client/ProductDetailView.vue'
import LoginView from '@/views/client/LoginView.vue'
import RegisterView from '@/views/client/RegisterView.vue'
import ProfileView from '@/views/client/ProfileView.vue'

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
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router