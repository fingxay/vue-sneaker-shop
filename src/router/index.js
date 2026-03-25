import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/client/HomeView.vue'
import CartView from '@/views/client/CartView.vue'
import ProductDetailView from '@/views/client/ProductDetailView.vue'
import LoginView from '@/views/client/LoginView.vue'
import RegisterView from '@/views/client/RegisterView.vue'
import ProfileView from '@/views/client/ProfileView.vue'
import CheckoutView from '@/views/client/CheckoutView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartView,
    meta: {
      requiresAuth: true
    }
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
    component: ProfileView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))

  if (to.meta.requiresAuth && !currentUser) {
    next('/login')
    return
  }

  next()
})

export default router