<template>
  <div class="app-layout">
    <HeaderClient />

    <main class="main-content">
      <router-view />
    </main>

    <FooterClient />
  </div>
</template>

<script setup>
import HeaderClient from './components/client/HeaderClient.vue'
import FooterClient from './components/client/FooterClient.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  min-height: 100%;
}

body {
  font-family: Arial, sans-serif;
}

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.container {
  width: min(1440px, calc(100% - 32px));
  margin: 0 auto;
}

html,
body {
  overscroll-behavior: none;
}
</style>