<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
      <div class="modal-box">
        <div class="toast-container">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            class="toast-success"
          >
            {{ toast.message }}
          </div>
        </div>

        <button type="button" class="close-btn" @click="handleClose">×</button>

        <div class="modal-content">
          <div class="modal-image-wrap">
            <img :src="productImage" :alt="product.name" class="modal-image" />
          </div>

          <div class="modal-info">
            <h2 class="modal-title">{{ product.name }}</h2>
            <p class="modal-price">{{ formatPrice(product.price) }}</p>

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
              Xác nhận thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import axios from 'axios'
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const selectedSize = ref('')
const quantity = ref(1)
const toasts = ref([])

const productImage = computed(() => {
  if (!props.product?.image) return ''
  return require(`@/assets/sneakers/${props.product.image}`)
})

const selectedSizeItem = computed(() => {
  if (!selectedSize.value || !props.product?.sizes) return null

  return props.product.sizes.find(
    (item) => item.size === selectedSize.value
  )
})

const formatPrice = (price) => {
  if (!price) return '0đ'
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

const selectSize = (sizeItem) => {
  selectedSize.value = sizeItem.size
  quantity.value = 1
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const increaseQuantity = () => {
  if (
    selectedSizeItem.value &&
    quantity.value < selectedSizeItem.value.quantity
  ) {
    quantity.value++
  }
}

const triggerToast = (message) => {
  const id = Date.now() + Math.random()

  if (toasts.value.length >= 5) {
    toasts.value.shift()
  }

  toasts.value.push({
    id,
    message
  })

  setTimeout(() => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }, 1800)
}

const resetModalState = () => {
  selectedSize.value = ''
  quantity.value = 1
  toasts.value = []
}

const handleClose = () => {
  resetModalState()
  emit('close')
}

watch(
  () => props.isOpen,
  (newValue) => {
    if (!newValue) {
      resetModalState()
    }
  }
)

const handleAddToCart = async () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))

  if (!currentUser) {
    handleClose()
    router.push('/login')
    return
  }

  if (!selectedSizeItem.value) return

  try {
    const userRes = await axios.get(`http://localhost:3000/users/${currentUser.id}`)
    const user = userRes.data

    const userCartItems = user.cart?.items || []

    const existingItem = userCartItems.find(
      (item) =>
        String(item.productId) === String(props.product.id) &&
        item.size === selectedSizeItem.value.size
    )

    const stockQuantity = selectedSizeItem.value.quantity || 0
    const currentCartQuantity = existingItem ? existingItem.quantity : 0
    const availableToAdd = stockQuantity - currentCartQuantity

    if (availableToAdd <= 0) {
      triggerToast('Sản phẩm trong giỏ đã đạt tối đa tồn kho')
      return
    }

    const quantityToAdd = Math.min(quantity.value, availableToAdd)

    if (existingItem) {
      existingItem.quantity += quantityToAdd
    } else {
      userCartItems.push({
        productId: props.product.id,
        size: selectedSizeItem.value.size,
        quantity: quantityToAdd,
        addedAt: new Date().toISOString()
      })
    }

    await axios.patch(`http://localhost:3000/users/${currentUser.id}`, {
      cart: {
        items: userCartItems,
        updatedAt: new Date().toISOString()
      }
    })

    triggerToast('Đã thêm vào giỏ hàng')
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 3000;
}

.modal-box {
  width: 100%;
  max-width: 900px;
  background: #fff;
  border-radius: 20px;
  position: relative;
  overflow: visible;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
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

.close-btn {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 38px;
  height: 38px;
  border: none;
  background: #f3f3f3;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  z-index: 2;
}

.modal-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  padding: 32px;
}

.modal-image-wrap {
  background: #f8f8f8;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-image {
  width: 100%;
  max-width: 360px;
  object-fit: contain;
}

.modal-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.modal-title {
  font-size: 30px;
  line-height: 1.4;
  margin-bottom: 14px;
  color: #111;
}

.modal-price {
  font-size: 28px;
  font-weight: 700;
  color: #dc2626;
  margin-bottom: 24px;
}

.size-label,
.quantity-label {
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

@media (max-width: 768px) {
  .modal-content {
    grid-template-columns: 1fr;
    padding: 24px;
  }

  .modal-title {
    font-size: 24px;
  }

  .modal-price {
    font-size: 24px;
  }

  .toast-container {
    top: 8px;
    right: 8px;
    left: 8px;
  }

  .toast-success {
    min-width: 0;
    max-width: 100%;
  }
}
</style>