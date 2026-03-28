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
import HeaderClient from '@/components/client/HeaderClient.vue'
import FooterClient from '@/components/client/FooterClient.vue'
</script>