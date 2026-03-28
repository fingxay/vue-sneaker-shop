<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <h2 class="admin-logo">Admin Panel</h2>

      <nav class="admin-nav">
        <router-link to="/admin">Dashboard</router-link>
        <router-link to="/admin/products">Sản phẩm</router-link>
        <router-link to="/admin/orders">Đơn hàng</router-link>
        <router-link to="/">Về trang shop</router-link>
      </nav>
    </aside>

    <main class="admin-main">
      <div class="admin-topbar">
        <h1>Admin Layout</h1>
      </div>

      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  background: #f5f7fb;
}

.admin-sidebar {
  width: 240px;
  background: #111827;
  color: white;
  padding: 24px 16px;
  flex-shrink: 0;
}

.admin-logo {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 24px;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-nav a {
  color: white;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 10px;
  font-weight: 600;
  transition: 0.2s ease;
}

.admin-nav a:hover,
.admin-nav a.router-link-active {
  background: #facc15;
  color: #111;
}

.admin-main {
  flex: 1;
  padding: 24px;
}

.admin-topbar {
  margin-bottom: 24px;
}

.admin-topbar h1 {
  font-size: 28px;
  font-weight: 700;
  color: #111;
}
</style>