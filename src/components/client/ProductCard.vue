<template>
  <div class="product-card">
    <img :src="getImage(product.image)" :alt="product.name" class="product-image" />

    <h3 class="product-name">{{ product.name }}</h3>
    <p class="product-price">{{ formatPrice(product.price) }}</p>

    <button type="button" class="add-to-cart-btn">
      Thêm vào giỏ hàng
    </button>
  </div>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: true
  }
})

const getImage = (imageName) => {
  return require(`@/assets/sneakers/${imageName}`)
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
}
</script>

<style scoped>
.product-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  background: #fff;
  transition: 0.3s;
  display: flex;
  flex-direction: column;
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
  margin-bottom: 14px;
}

.add-to-cart-btn {
  margin-top: auto;
  width: 100%;
  height: 42px;
  border: none;
  border-radius: 8px;
  background: #111;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.add-to-cart-btn:hover {
  background: #facc15;
  color: #111;
}

.add-to-cart-btn:active {
  transform: scale(0.97);
  background: #eab308;
}
</style>