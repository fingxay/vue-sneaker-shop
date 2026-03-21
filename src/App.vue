<template>
  <div>
    <HeaderClient />
    <router-view />
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

body {
  font-family: Arial, sans-serif;
}

.container {
  width: 1200px;
  max-width: 95%;
  margin: 0 auto;
}
</style>