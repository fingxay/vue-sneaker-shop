<template>
  <header class="header">
    <div class="container header-wrap">
      <div class="header-left">
        <div class="logo">Sneaker Shop</div>

        <nav class="nav">
          <div
            class="nav-dropdown"
            @mouseenter="showBrandMenu = true"
            @mouseleave="showBrandMenu = false"
          >
            <router-link to="/" class="nav-link">Sản phẩm</router-link>

            <div v-if="showBrandMenu" class="dropdown-menu">
              <button
                v-for="brand in brands"
                :key="brand"
                type="button"
                class="dropdown-item"
                @click="selectBrand(brand)"
              >
                {{ brand }}
              </button>
            </div>
          </div>
        </nav>
      </div>

      <div class="header-center">
        <div class="search-box">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="Tìm sản phẩm..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button type="button" class="search-btn" @click="handleSearch">Tìm</button>
        </div>
      </div>

      <div class="header-right">
        <nav class="nav">
          <router-link to="/">Giỏ hàng</router-link>
        </nav>

        <button type="button" class="login-btn">Đăng nhập</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const showBrandMenu = ref(false)
const searchKeyword = ref(route.query.q || '')

const brands = ['Tất cả', 'Nike', 'Adidas', 'MLB', 'Vans', 'New Balance', 'Puma']

const selectBrand = (brand) => {
  showBrandMenu.value = false

  const query = {
    ...route.query
  }

  if (brand === 'Tất cả') {
    delete query.brand
  } else {
    query.brand = brand
  }

  router.push({
    path: '/',
    query
  })
}

const handleSearch = () => {
  const keyword = searchKeyword.value.trim()

  const query = {
    ...route.query
  }

  if (keyword) {
    query.q = keyword
  } else {
    delete query.q
  }

  router.push({
    path: '/',
    query
  })
}

watch(
  () => route.query.q,
  (newValue) => {
    searchKeyword.value = newValue || ''
  }
)
</script>

<style scoped>
.header {
  background: #111;
  color: white;
  padding: 16px 0;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.header-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 28px;
  flex: 1;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-right {
  justify-content: flex-end;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  white-space: nowrap;
}

.nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav a {
  color: white;
  text-decoration: none;
  font-weight: 600;
  transition: 0.2s ease;
  white-space: nowrap;
}

.nav a:hover,
.nav a.router-link-active {
  color: #facc15;
}

.nav-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  height: 52px;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 600;
  transition: 0.2s ease;
  white-space: nowrap;
}

.nav-link:hover {
  color: #facc15;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  overflow: hidden;
}

.dropdown-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: white;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #111;
  transition: 0.2s ease;
}

.dropdown-item:hover {
  background: #f5f5f5;
  color: #facc15;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid #ddd;
  width: 100%;
  max-width: 420px;
}

.search-input {
  flex: 1;
  height: 42px;
  border: none;
  outline: none;
  padding: 0 14px;
  font-size: 14px;
}

.search-btn {
  height: 42px;
  border: none;
  background: #facc15;
  color: #111;
  font-weight: 600;
  padding: 0 18px;
  cursor: pointer;
}

.login-btn {
  height: 42px;
  padding: 0 18px;
  border: 1px solid #facc15;
  background: transparent;
  color: #facc15;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}
</style>