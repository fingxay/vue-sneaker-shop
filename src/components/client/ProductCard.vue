<template>
  <div class="product-card">
    <img :src="productImage" :alt="product.name" class="product-image" />

    <h3 class="product-name">{{ product.name }}</h3>

    <p class="product-price">{{ formatPrice(product.price) }}</p>

    <button type="button" class="add-cart-btn" @click="openModal">
      Thêm vào giỏ hàng
    </button>

    <ProductSizeModal
      :isOpen="showSizeModal"
      :product="product"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ProductSizeModal from './ProductSizeModal.vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const showSizeModal = ref(false)

const productImage = computed(() => {
  return require(`@/assets/sneakers/${props.product.image}`)
})

const formatPrice = (price) => {
  return price.toLocaleString('vi-VN') + 'đ'
}

const openModal = () => {
  showSizeModal.value = true
}

const closeModal = () => {
  showSizeModal.value = false
}
</script>

<style scoped>
.product-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: 0.2s ease;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.product-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 14px;
}

.product-name {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.5;
  margin-bottom: 14px;
  color: #111;
  min-height: calc(1.5em * 3);
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: red;
  margin-bottom: 16px;
}

.add-cart-btn {
  width: 100%;
  height: 42px;
  border: none;
  border-radius: 10px;
  background: #111;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
  margin-top: auto;
}

.add-cart-btn:hover {
  opacity: 0.92;
}

.add-cart-btn:active {
  transform: scale(0.98);
}
</style>