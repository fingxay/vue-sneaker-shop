<template>
  <div class="product-list">
    <h2 class="title">Danh sách sản phẩm</h2>

    <div class="product-grid">
      <div class="product-card" v-for="product in paginatedProducts" :key="product.id">
        <img :src="getImage(product.image)" :alt="product.name" class="product-image" />

        <h3 class="product-name">{{ product.name }}</h3>
        <p class="product-price">{{ formatPrice(product.price) }}</p>
      </div>
    </div>
  </div>

  <div class="pagination" v-if="totalPages > 1">
    <button
      class="page-btn"
      :disabled="currentPage === 1"
      @click="currentPage--"
    >
      Prev
    </button>

    <button
      v-for="page in totalPages"
      :key="page"
      class="page-btn"
      :class="{ active: currentPage === page }"
      @click="currentPage = page"
    >
      {{ page }}
    </button>

    <button
      class="page-btn"
      :disabled="currentPage === totalPages"
      @click="currentPage++"
    >
      Next
    </button>
  </div>
</template>

<script setup>

import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const products = ref([])
const currentPage = ref(1)
const itemsPerPage = 12

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return products.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(products.value.length / itemsPerPage)
})

const fetchProducts = async () => {
  const res = await axios.get('http://localhost:3000/products')
  products.value = res.data
}

const getImage = (imageName) => {
  return require(`@/assets/sneakers/${imageName}`)
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.product-list {
  padding: 30px 0;
}

.title {
  font-size: 36px;
  margin-bottom: 20px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  background: #fff;
  transition: 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.product-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
}

.product-name {
  font-size: 18px;
  margin-bottom: 10px;
  line-height: 1.4;
  min-height: calc(1.4em * 3);
}

.product-price {
  color: red;
  font-weight: bold;
  font-size: 18px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.page-btn {
  padding: 8px 14px;
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #111;
  color: #fff;
  border-color: #111;
}

.page-btn.active {
  background: #111;
  color: #fff;
  border-color: #111;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>