<template>
  <header class="header">
    <div class="container header-wrap">
      <div class="logo">Sneaker Shop</div>

      <nav class="nav">
        <router-link to="/">Trang chủ</router-link>
        <router-link to="/">Sản phẩm</router-link>
        <router-link to="/">Giỏ hàng</router-link>
      </nav>
    </div>
  </header>
</template>

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
}

.header-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: 700;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.nav a.router-link-active {
  color: #facc15;
}
</style>