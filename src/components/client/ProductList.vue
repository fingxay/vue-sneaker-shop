<template>
  <div class="product-list">
    <h2 class="title">Danh sách sản phẩm</h2>

    <div class="product-grid">
      <div class="product-card" v-for="product in products" :key="product.id">
        <img :src="getImage(product.image)" :alt="product.name" class="product-image" />

        <h3 class="product-name">{{ product.name }}</h3>
        <p class="product-price">{{ formatPrice(product.price) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'

const products = ref([])

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
  min-height: 48px;
}

.product-price {
  color: red;
  font-weight: bold;
  font-size: 18px;
}
</style>