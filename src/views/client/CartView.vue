<template>
  <div class="cart-page">
    <div class="container">
      <h1 class="cart-title">Giỏ hàng</h1>

      <div v-if="cartItems.length > 0" class="cart-layout">
        <div class="cart-left">
          <div class="cart-box">
            <div class="cart-header">
              <div class="header-cell product-col">Sản phẩm</div>
              <div class="header-cell">Đơn giá</div>
              <div class="header-cell">Số lượng</div>
              <div class="header-cell">Thành tiền</div>
              <div class="header-cell">Thao tác</div>
            </div>

            <div
              v-for="(cartItem, index) in cartItems"
              :key="`${cartItem.productId}-${cartItem.size}-${index}`"
              class="cart-item"
            >
              <div class="cart-product">
                <img
                  :src="require(`@/assets/sneakers/${cartItem.image}`)"
                  :alt="cartItem.name"
                  class="cart-product-image"
                />

                <div class="cart-product-info">
                  <h3 class="cart-product-name">{{ cartItem.name }}</h3>
                  <p class="cart-product-size">Size: {{ cartItem.size }}</p>
                </div>
              </div>

              <div class="cart-cell cart-price">
                <span class="mobile-label">Đơn giá:</span>
                <span>{{ formatPrice(cartItem.price || 0) }}</span>
              </div>

              <div class="cart-cell cart-quantity">
                <span class="mobile-label">Số lượng:</span>

                <div class="qty-controls">
                  <button
                    type="button"
                    class="qty-btn"
                    :disabled="(cartItem.quantity || 0) <= 1"
                    @click="decreaseQuantity(index)"
                  >
                    -
                  </button>

                  <span class="qty-value">{{ cartItem.quantity || 0 }}</span>

                  <button
                    type="button"
                    class="qty-btn"
                    :disabled="(cartItem.quantity || 0) >= (cartItem.stock || 0)"
                    @click="increaseQuantity(index)"
                  >
                    +
                  </button>
                </div>
              </div>

              <div class="cart-cell cart-total">
                <span class="mobile-label">Thành tiền:</span>
                <span>
                  {{ formatPrice((cartItem.price || 0) * (cartItem.quantity || 0)) }}
                </span>
              </div>

              <div class="cart-cell cart-action">
                <span class="mobile-label">Thao tác:</span>
                <button
                  type="button"
                  class="remove-btn"
                  @click="removeCartItem(index)"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="cart-right">
          <div class="summary-box">
            <h2 class="summary-title">Tóm tắt đơn hàng</h2>

            <div class="summary-row">
              <span>Tạm tính</span>
              <span>{{ formatPrice(totalAmount) }}</span>
            </div>

            <div class="summary-row">
              <span>Phí vận chuyển</span>
              <span>0đ</span>
            </div>

            <div class="summary-row total">
              <span>Tổng cộng</span>
              <span>{{ formatPrice(totalAmount) }}</span>
            </div>

            <button type="button" class="checkout-btn">
              Tiến hành thanh toán
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-cart">
        <div class="empty-cart-box">
          <h2 class="empty-cart-title">Giỏ hàng đang trống</h2>
          <p class="empty-cart-text">
            Bạn chưa thêm sản phẩm nào vào giỏ hàng.
          </p>
          <router-link to="/" class="continue-shopping-btn">
            Tiếp tục mua sắm
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const cartItems = ref([])

const totalAmount = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.price || 0) * (item.quantity || 0)
  }, 0)
})

const formatPrice = (price) => {
  return price.toLocaleString('vi-VN') + 'đ'
}

const fetchCartItems = async () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))

  if (!currentUser) {
    cartItems.value = []
    return
  }

  try {
    const userRes = await axios.get(`http://localhost:3000/users/${currentUser.id}`)
    const user = userRes.data

    const userCartItems = user.cart?.items || []

    if (!userCartItems.length) {
      cartItems.value = []
      return
    }

    const productRequests = userCartItems.map((item) =>
      axios.get(`http://localhost:3000/products/${item.productId}`)
    )

    const productResponses = await Promise.all(productRequests)
    const products = productResponses.map((res) => res.data)

    cartItems.value = userCartItems.map((item) => {
      const product = products.find(
        (productItem) => productItem.id === item.productId
      )

      const sizeInfo = product?.sizes?.find(
        (sizeItem) => sizeItem.size === item.size
      )

      return {
        productId: item.productId,
        name: product?.name || '',
        image: product?.image || '',
        price: product?.price || 0,
        size: item.size,
        quantity: item.quantity,
        stock: sizeInfo?.quantity || 0,
        addedAt: item.addedAt
      }
    })
  } catch (error) {
    console.error(error)
    cartItems.value = []
  }
}

const removeCartItem = async (index) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))
  if (!currentUser) return

  try {
    const userRes = await axios.get(`http://localhost:3000/users/${currentUser.id}`)
    const user = userRes.data
    const userCartItems = user.cart?.items || []

    userCartItems.splice(index, 1)

    await axios.patch(`http://localhost:3000/users/${currentUser.id}`, {
      cart: {
        items: userCartItems,
        updatedAt: new Date().toISOString()
      }
    })

    await fetchCartItems()
  } catch (error) {
    console.error(error)
  }
}
const increaseQuantity = async (index) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))
  if (!currentUser) return

  const item = cartItems.value[index]
  if (!item) return
  if (item.quantity >= item.stock) return

  try {
    const userRes = await axios.get(`http://localhost:3000/users/${currentUser.id}`)
    const user = userRes.data
    const userCartItems = user.cart?.items || []

    if (!userCartItems[index]) return

    userCartItems[index].quantity += 1

    await axios.patch(`http://localhost:3000/users/${currentUser.id}`, {
      cart: {
        items: userCartItems,
        updatedAt: new Date().toISOString()
      }
    })

    await fetchCartItems()
  } catch (error) {
    console.error(error)
  }
}
const decreaseQuantity = async (index) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))
  if (!currentUser) return

  const item = cartItems.value[index]
  if (!item) return
  if (item.quantity <= 1) return

  try {
    const userRes = await axios.get(`http://localhost:3000/users/${currentUser.id}`)
    const user = userRes.data
    const userCartItems = user.cart?.items || []

    if (!userCartItems[index]) return

    userCartItems[index].quantity -= 1

    await axios.patch(`http://localhost:3000/users/${currentUser.id}`, {
      cart: {
        items: userCartItems,
        updatedAt: new Date().toISOString()
      }
    })

    await fetchCartItems()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchCartItems()
})
</script>

<style scoped>
.cart-page {
  padding: 40px 0 60px;
}

.cart-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #111;
}

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 2.3fr) minmax(320px, 1fr);
  gap: 28px;
  align-items: start;
}

.cart-box,
.summary-box {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.cart-right {
  position: sticky;
  top: 110px;
}

.cart-header,
.cart-item {
  display: grid;
  grid-template-columns: minmax(360px, 2.8fr) 130px 150px 150px 100px;
  gap: 18px;
  align-items: center;
}

.cart-header {
  background: #111;
  color: #fff;
  padding: 20px 24px;
}

.header-cell {
  text-align: center;
  font-size: 15px;
  font-weight: 700;
}

.product-col {
  text-align: left;
}

.cart-item {
  padding: 24px;
}

.cart-product {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}

.cart-product-image {
  width: 110px;
  height: 110px;
  object-fit: cover;
  border-radius: 14px;
  background: #f5f5f5;
  flex-shrink: 0;
}

.cart-product-info {
  min-width: 0;
}

.cart-product-name {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.45;
  color: #111;
  margin-bottom: 10px;
  overflow-wrap: break-word;
}

.cart-product-size {
  font-size: 15px;
  color: #666;
}

.cart-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 110px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #111;
}

.qty-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.qty-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
}

.qty-value {
  min-width: 24px;
  text-align: center;
}

.remove-btn {
  border: none;
  background: transparent;
  color: #dc2626;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.mobile-label {
  display: none;
}

.summary-box {
  padding: 24px;
}

.summary-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #111;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #eee;
  font-size: 16px;
  color: #333;
}

.summary-row.total {
  border-bottom: none;
  padding-top: 18px;
  font-size: 20px;
  font-weight: 700;
  color: #111;
}

.checkout-btn {
  width: 100%;
  height: 50px;
  margin-top: 20px;
  border: none;
  border-radius: 12px;
  background: #facc15;
  color: #111;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.checkout-btn:hover {
  opacity: 0.92;
}

@media (max-width: 1469px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .cart-right {
    position: static;
  }

  .cart-header,
  .cart-item {
    grid-template-columns: minmax(300px, 2.4fr) 120px 140px 140px 90px;
    gap: 14px;
  }
}

@media (max-width: 943px) {
  .cart-title {
    font-size: 28px;
  }

  .cart-header {
    display: none;
  }

  .cart-item {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .cart-product {
    align-items: flex-start;
  }

  .cart-product-image {
    width: 96px;
    height: 96px;
  }

  .cart-product-name {
    font-size: 17px;
  }

  .cart-cell {
    min-height: auto;
    justify-content: space-between;
    text-align: left;
    font-size: 15px;
  }

  .mobile-label {
    display: inline-block;
    font-size: 14px;
    font-weight: 700;
    color: #666;
  }
}

@media (max-width: 480px) {
  .cart-page {
    padding: 28px 0 40px;
  }

  .cart-title {
    font-size: 24px;
    margin-bottom: 18px;
  }

  .cart-item,
  .summary-box {
    padding: 16px;
  }

  .cart-product {
    gap: 12px;
  }

  .cart-product-image {
    width: 84px;
    height: 84px;
  }

  .cart-product-name {
    font-size: 16px;
  }

  .qty-controls {
    gap: 8px;
  }

  .summary-title {
    font-size: 20px;
  }

  .summary-row {
    font-size: 15px;
  }

  .summary-row.total {
    font-size: 18px;
  }

  .checkout-btn {
    height: 44px;
    font-size: 15px;
  }
}

.empty-cart {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 420px;
}

.empty-cart-box {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-cart-title {
  font-size: 30px;
  font-weight: 700;
  color: #111;
  margin-bottom: 14px;
}

.empty-cart-text {
  font-size: 16px;
  line-height: 1.7;
  color: #666;
  margin-bottom: 24px;
}

.continue-shopping-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 220px;
  height: 48px;
  padding: 0 20px;
  border-radius: 12px;
  background: #facc15;
  color: #111;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: 0.2s ease;
}

.continue-shopping-btn:hover {
  opacity: 0.92;
}

@media (max-width: 480px) {
  .empty-cart {
    min-height: 320px;
  }

  .empty-cart-box {
    padding: 28px 20px;
    border-radius: 16px;
  }

  .empty-cart-title {
    font-size: 24px;
  }

  .empty-cart-text {
    font-size: 15px;
  }

  .continue-shopping-btn {
    width: 100%;
    min-width: unset;
    height: 44px;
    font-size: 15px;
  }
}
</style>