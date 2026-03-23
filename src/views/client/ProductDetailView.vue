<template>
  <div class="product-detail-page">
    <div class="container">
      <div class="toast-container">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-success"
        >
          {{ toast.message }}
        </div>
      </div>

      <div v-if="product">
        <div class="product-detail">
          <div class="product-image-wrap">
            <img :src="productImage" :alt="product.name" class="product-image" />
          </div>

          <div class="product-info">
            <h1 class="product-title">{{ product.name }}</h1>
            <p class="product-price">{{ formatPrice(product.price) }}</p>
            <p class="size-label">Chọn size:</p>

            <div class="size-list">
              <button
                v-for="sizeItem in product.sizes"
                :key="sizeItem.id"
                type="button"
                class="size-btn"
                :class="{ active: selectedSize === sizeItem.size }"
                :disabled="!sizeItem.quantity"
                @click="selectSize(sizeItem)"
              >
                {{ sizeItem.size }}
              </button>
            </div>

            <p v-if="selectedSizeItem" class="stock-text">
              Còn lại: <strong>{{ selectedSizeItem.quantity }}</strong> sản phẩm
            </p>

            <div v-if="selectedSizeItem" class="quantity-wrap">
              <p class="quantity-label">Số lượng:</p>

              <div class="quantity-box">
                <button
                  type="button"
                  class="qty-btn"
                  :disabled="quantity <= 1"
                  @click="decreaseQuantity"
                >
                  -
                </button>

                <span class="qty-value">{{ quantity }}</span>

                <button
                  type="button"
                  class="qty-btn"
                  :disabled="quantity >= selectedSizeItem.quantity"
                  @click="increaseQuantity"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              class="add-cart-btn"
              :disabled="!selectedSize"
              @click="handleAddToCart"
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>

        <div class="product-description-section">
          <h2 class="description-title">Mô tả sản phẩm</h2>
          <p class="description-text">{{ product.description }}</p>
        </div>
      </div>

      <p v-else>Đang tải sản phẩm...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const product = ref(null)

const selectedSize = ref('')

const quantity = ref(1)

const toasts = ref([])

const increaseQuantity = () => {
  if (
    selectedSizeItem.value &&
    quantity.value < selectedSizeItem.value.quantity
  ) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const selectSize = (sizeItem) => {
  selectedSize.value = sizeItem.size
  quantity.value = 1
}

const selectedSizeItem = computed(() => {
  if (!selectedSize.value || !product.value?.sizes) return null

  return product.value.sizes.find(
    (item) => item.size === selectedSize.value
  )
})

const fetchProductDetail = async () => {
  const res = await axios.get(`http://localhost:3000/products/${route.params.id}`)
  product.value = res.data
}

onMounted(() => {
  fetchProductDetail()
})

const productImage = computed(() => {
  if (!product.value?.image) return ''
  return require(`@/assets/sneakers/${product.value.image}`)
})

const formatPrice = (price) => {
  if (!price) return '0đ'
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

const triggerToast = () => {
  const id = Date.now() + Math.random()

  if (toasts.value.length >= 5) {
    toasts.value.shift()
  }

  toasts.value.push({
    id,
    message: 'Đã thêm vào giỏ hàng +'
  })

  setTimeout(() => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }, 1800)
}

const handleAddToCart = async () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))

  if (!currentUser) {
    router.push('/login')
    return
  }

  if (!product.value || !selectedSizeItem.value) return

  try {
    const userRes = await axios.get(`http://localhost:3000/users/${currentUser.id}`)
    const user = userRes.data

    const userCartItems = user.cart?.items || []

    const cartItem = {
      productId: product.value.id,
      size: selectedSizeItem.value.size,
      quantity: quantity.value,
      addedAt: new Date().toISOString()
    }

    const existingItem = userCartItems.find(
      (item) =>
        item.productId === cartItem.productId &&
        item.size === cartItem.size
    )

    if (existingItem) {
      existingItem.quantity += cartItem.quantity
    } else {
      userCartItems.push(cartItem)
    }

    await axios.patch(`http://localhost:3000/users/${currentUser.id}`, {
      cart: {
        items: userCartItems,
        updatedAt: new Date().toISOString()
      }
    })

    triggerToast()
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
.product-detail-page {
  padding: 120px 0 60px;
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

.product-image-wrap {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.product-image {
  width: 100%;
  max-width: 500px;
  display: block;
  margin: 0 auto;
  object-fit: contain;
}

.product-info {
  padding-top: 12px;
}

.product-title {
  font-size: 38px;
  line-height: 1.4;
  margin-bottom: 18px;
  color: #111;
}

.product-price {
  font-size: 32px;
  font-weight: 700;
  color: #dc2626;
}

@media (max-width: 900px) {
  .product-detail {
    grid-template-columns: 1fr;
  }

  .product-title {
    font-size: 30px;
  }

  .product-price {
    font-size: 26px;
  }
}

.size-label {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 14px;
  color: #111;
}

.size-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
}

.size-btn {
  min-width: 56px;
  height: 44px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.size-btn:hover:not(:disabled) {
  border-color: #111;
}

.size-btn.active {
  background: #111;
  color: #fff;
  border-color: #111;
}

.size-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stock-text {
  font-size: 15px;
  color: #444;
  margin-bottom: 18px;
}

.quantity-wrap {
  margin-bottom: 22px;
}

.quantity-label {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 14px;
  color: #111;
}

.quantity-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 10px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-value {
  min-width: 28px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #111;
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

.toast-container {
  position: fixed;
  top: 100px;
  right: 24px;
  z-index: 4000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast-success {
  min-width: 220px;
  max-width: 320px;
  background: #16a34a;
  color: #fff;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  opacity: 0;
  transform: translateX(30px);
  animation: toastIn 0.28s ease forwards;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.product-description-section {
  margin-top: 40px;
  background: #fff;
  border-radius: 20px;
  padding: 28px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.description-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 18px;
  color: #111;
}

.description-text {
  font-size: 16px;
  line-height: 1.8;
  color: #444;
  white-space: pre-line;
}
</style>