<template>
  <div class="product-card">
    <router-link
      :to="`/product/${product.id}`"
      class="product-link"
    >
      <img :src="productImage" :alt="product.name" class="product-image" />
      <h3 class="product-name">{{ product.name }}</h3>
    </router-link>

    <p class="product-price">{{ formatPrice(product.price) }}</p>

    <button type="button" class="add-cart-btn" @click="openModal">
      Thêm vào giỏ hàng
    </button>

    <ProductSizeModal
      :isOpen="showSizeModal"
      :product="product"
      @close="closeModal"
      @add-to-cart="handleAddToCart"
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

const emit = defineEmits(['add-to-cart'])

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

const handleAddToCart = (cartItem) => {
  emit('add-to-cart', cartItem)
}
</script>

<style scoped>
.product-card {
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12);
  border-color: #facc15;
}

.product-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 16px;
  background: #f8f8f8;
  margin-bottom: 16px;
}

.product-name {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.5;
  color: #111;
  margin-bottom: 14px;
  min-height: 54px;
}

.product-price {
  font-size: 28px;
  font-weight: 700;
  color: #dc2626;
  margin-bottom: 18px;
}

.add-cart-btn {
  width: 100%;
  max-width: 320px;
  height: 50px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #facc15 0%, #eab308 100%);
  color: #111;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
  box-shadow: 0 10px 22px rgba(234, 179, 8, 0.28);
}

.add-cart-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.03);
  box-shadow: 0 14px 28px rgba(234, 179, 8, 0.38);
}

.add-cart-btn:active:not(:disabled) {
  transform: translateY(0);
  filter: brightness(0.98);
  box-shadow: 0 6px 14px rgba(234, 179, 8, 0.24);
}

.add-cart-btn:disabled {
  background: #f3e7a3;
  color: #7c6f32;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  filter: none;
}

.product-link {
  display: block;
  text-decoration: none;
  color: inherit;
}
</style>