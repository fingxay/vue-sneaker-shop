<template>
  <div class="container home">
    <h1 class="title">Tất cả sản phẩm</h1>

    <div class="product-grid">
      <div class="product-card" v-for="product in products" :key="product.id">
        <img
          :src="getImage(product.id)"
          :alt="product.name"
          class="product-image"
        />

        <h3 class="product-name">{{ product.name }}</h3>
        <p class="product-price">{{ formatPrice(product.price) }}</p>

        <div class="size-list">
          <span
            v-for="size in product.sizes"
            :key="size.id"
            class="size-item"
          >
            {{ size.size }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'

const products = ref([])

const fetchProducts = async () => {
  try {
    const res = await axios.get('http://localhost:3000/products')
    products.value = res.data
  } catch (error) {
    console.error('Lỗi lấy sản phẩm:', error)
  }
}

const formatPrice = (price) => {
  return price.toLocaleString('vi-VN') + ' đ'
}

const getImage = (id) => {
  return require(`@/assets/sneakers/${id}.jpg`)
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.home {
  padding: 30px 0;
}

.title {
  margin-bottom: 24px;
  font-size: 32px;
  font-weight: 700;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 16px;
  background: #fff;
  transition: 0.3s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
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
  font-weight: 700;
  margin-bottom: 10px;
}

.size-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.size-item {
  padding: 4px 10px;
  border: 1px solid #333;
  border-radius: 6px;
  font-size: 14px;
}
</style>