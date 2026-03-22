<template>
  <div class="product-list">
    <h2 class="title">Danh sách sản phẩm</h2>

    <div class="product-grid">
      <ProductCard
        v-for="product in paginatedProducts"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>

  <div class="pagination" v-if="totalPages > 1">
    <button
      type="button"
      class="page-btn"
      :disabled="currentPage === 1"
      @click="currentPage--"
    >
      Prev
    </button>

    <button
      v-for="page in totalPages"
      :key="page"
      type="button"
      class="page-btn"
      :class="{ active: currentPage === page }"
      @click="currentPage = page"
    >
      {{ page }}
    </button>

    <button
      type="button"
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
import ProductCard from './ProductCard.vue'

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