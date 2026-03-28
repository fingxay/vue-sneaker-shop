import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/client/HomeView.vue'
import CartView from '@/views/client/CartView.vue'
import ProductDetailView from '@/views/client/ProductDetailView.vue'
import LoginView from '@/views/client/LoginView.vue'
import RegisterView from '@/views/client/RegisterView.vue'
import ProfileView from '@/views/client/ProfileView.vue'
import CheckoutView from '@/views/client/CheckoutView.vue'
import OrdersView from '@/views/client/OrdersView.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import ClientLayout from '@/layouts/ClientLayout.vue'
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue'
import AdminProductsView from '@/views/admin/AdminProductsView.vue'
import AdminOrdersView from '@/views/admin/AdminOrdersView.vue'

const routes = [
  {
    path: '/',
    component: ClientLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView
      },
      {
        path: 'cart',
        name: 'cart',
        component: CartView,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'product/:id',
        name: 'product-detail',
        component: ProductDetailView
      },
      {
        path: 'login',
        name: 'login',
        component: LoginView
      },
      {
        path: 'register',
        name: 'register',
        component: RegisterView
      },
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'checkout',
        name: 'checkout',
        component: CheckoutView,
        meta: { requiresAuth: true }
      },
      {
        path: 'orders',
        name: 'orders',
        component: OrdersView,
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: AdminDashboardView
      },
      {
        path: 'products',
        name: 'admin-products',
        component: AdminProductsView
      },
      {
        path: 'orders',
        name: 'admin-orders',
        component: AdminOrdersView
      }
    ]
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

  if (to.meta.requiresAdmin && currentUser?.role !== 'admin') {
    next('/')
    return
  }

  next()
})

export default router