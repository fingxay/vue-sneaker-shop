<template>
  <div class="checkout-page">
    <div class="container">
      <h1 class="checkout-title">Thanh toán</h1>

      <div class="checkout-layout">
        <div class="checkout-left">
          <div class="checkout-card">
            <h2>Thông tin nhận hàng</h2>

            <div class="form-grid">
              <div class="form-group">
                <label>Họ và tên</label>
                <input v-model="shippingInfo.fullName" type="text" placeholder="Nhập họ và tên" />
              </div>

              <div class="form-group">
                <label>Số điện thoại</label>
                <input v-model="shippingInfo.phone" type="text" placeholder="Nhập số điện thoại" />
              </div>

              <div class="form-group full-width">
                <label>Địa chỉ</label>
                <input v-model="shippingInfo.address" type="text" placeholder="Nhập địa chỉ nhận hàng" />
              </div>

              <div class="form-group">
                <label>Tỉnh / Thành phố</label>
                <input v-model="shippingInfo.city" type="text" placeholder="Ví dụ: Hà Nội" />
              </div>

              <div class="form-group">
                <label>Ghi chú</label>
                <input v-model="shippingInfo.note" type="text" placeholder="Ghi chú thêm nếu có" />
              </div>
            </div>
          </div>

          <div class="checkout-card">
            <h2>Phương thức thanh toán</h2>

            <div class="payment-list">
              <label class="payment-option">
                <input v-model="paymentMethod" type="radio" value="cod" />
                <div class="payment-content">
                  <span class="payment-name">Thanh toán khi nhận hàng (COD)</span>
                  <span class="payment-desc">Thanh toán bằng tiền mặt khi đơn được giao tới nơi.</span>
                </div>
              </label>

              <label class="payment-option">
                <input v-model="paymentMethod" type="radio" value="banking" />
                <div class="payment-content">
                  <span class="payment-name">Chuyển khoản ngân hàng</span>
                  <span class="payment-desc">Quét mã QR để thực hiện thanh toán</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="checkout-right">
          <div class="checkout-card">
            <h2>Tóm tắt đơn hàng</h2>

            <div v-if="loading" class="summary-empty">
              Đang tải đơn hàng...
            </div>

            <div v-else-if="!cartItems.length" class="summary-empty">
              Giỏ hàng của bạn đang trống
            </div>

            <div v-else>
              <div class="summary-list">
                <div v-for="item in cartItems" :key="`${item.productId}-${item.size}`" class="summary-item">
                  <div class="summary-item-info">
                    <p class="summary-item-name">{{ item.name }}</p>
                    <p class="summary-item-meta">Size: {{ item.size }} × {{ item.quantity }}</p>
                  </div>

                  <p class="summary-item-price">
                    {{ formatPrice(item.price * item.quantity) }}
                  </p>
                </div>
              </div>

              <div class="summary-total">
                <div class="summary-row">
                  <span>Tạm tính</span>
                  <strong>{{ formatPrice(subtotal) }}</strong>
                </div>

                <div class="summary-row">
                  <span>Phí vận chuyển</span>
                  <strong>{{ formatPrice(shippingFee) }}</strong>
                </div>

                <div class="summary-row total">
                  <span>Tổng cộng</span>
                  <strong>{{ formatPrice(totalAmount) }}</strong>
                </div>
              </div>

              <p v-if="checkoutError" class="checkout-error">
                {{ checkoutError }}
              </p>

              <button
                type="button"
                class="place-order-btn"
                :disabled="!cartItems.length || isProcessingBankTransfer"
                @click="handlePlaceOrder"
              >
                Đặt hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showBankQrModal" class="bank-qr-overlay">
      <div class="bank-qr-modal">
        <h3 class="bank-qr-title">Quét mã để chuyển khoản</h3>

        <img
          class="bank-qr-image"
          :src="bankQrUrl" 
          alt="QR chuyển khoản ngân hàng"
        />

        <p class="bank-qr-note" v-if="!isProcessingBankTransfer">
          Vui lòng giữ nguyên màn hình để hệ thống xác nhận thanh toán.
        </p>

        <p class="bank-qr-note" v-else>
          Đang xác nhận thanh toán...
        </p>

        <button
          type="button"
          class="close-bank-qr-btn"
          :disabled="isProcessingBankTransfer"
          @click="handleCloseBankQrModal"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const showBankQrModal = ref(false)
const isProcessingBankTransfer = ref(false)
const bankTransferCode = ref('')
const bankTransferTimeout = ref(null)

const router = useRouter()

const checkoutError = ref('')

const paymentMethod = ref('cod')

const shippingInfo = reactive({
  fullName: '',
  phone: '',
  address: '',
  city: '',
  note: ''
})

const fillShippingInfoFromUser = async () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))
  if (!currentUser) return

  try {
    const res = await axios.get(`http://localhost:3000/users/${currentUser.id}`)
    const user = res.data

    shippingInfo.fullName = user.shippingInfo?.fullName || user.name || ''
    shippingInfo.phone = user.shippingInfo?.phone || ''
    shippingInfo.address = user.shippingInfo?.address || ''
    shippingInfo.city = user.shippingInfo?.city || ''
    shippingInfo.note = user.shippingInfo?.note || ''
  } catch (error) {
    console.error(error)
  }
}

const cartItems = ref([])
const loading = ref(false)

const fetchCheckoutItems = async () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))
  if (!currentUser) return

  try {
    loading.value = true

    const userRes = await axios.get(`http://localhost:3000/users/${currentUser.id}`)
    const user = userRes.data
    const items = user.cart?.items || []

    if (!items.length) {
      cartItems.value = []
      return
    }

    const productRequests = items.map((item) =>
      axios.get(`http://localhost:3000/products/${item.productId}`)
    )

    const productResponses = await Promise.all(productRequests)

    cartItems.value = items.map((item, index) => {
      const product = productResponses[index].data

      return {
        ...item,
        name: product.name,
        price: product.price,
        image: product.image
      }
    })
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const subtotal = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)
})

const shippingFee = computed(() => {
  if (!cartItems.value.length) return 0
  return subtotal.value >= 1000000 ? 0 : 30000
})

const totalAmount = computed(() => {
  return subtotal.value + shippingFee.value
})

const bankQrUrl = computed(() => {
  const bankBin = '970407'
  const accountNo = '19071215819014'
  const accountName = 'NGUYEN HONG TAI'
  const amount = totalAmount.value
  const addInfo = bankTransferCode.value || 'THANHTOAN'

  return `https://img.vietqr.io/image/${bankBin}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`
})

const formatPrice = (price) => {
  if (!price) return '0đ'
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

onMounted(async () => {
  await fillShippingInfoFromUser()
  await fetchCheckoutItems()
})

const createOrder = async () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    if (!currentUser) return

    const orderPayload = {
      userId: currentUser.id,
      customerInfo: {
        fullName: shippingInfo.fullName.trim(),
        phone: shippingInfo.phone.trim(),
        address: shippingInfo.address.trim(),
        city: shippingInfo.city.trim(),
        note: shippingInfo.note.trim()
      },
      paymentMethod: paymentMethod.value,
      items: cartItems.value.map((item) => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        size: item.size,
        quantity: item.quantity
      })),
      subtotal: subtotal.value,
      shippingFee: shippingFee.value,
      totalAmount: totalAmount.value,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    for (const item of cartItems.value) {
      const productRes = await axios.get(`http://localhost:3000/products/${item.productId}`)
      const product = productRes.data

      const updatedSizes = product.sizes.map((sizeItem) => {
        if (sizeItem.size === item.size) {
          return {
            ...sizeItem,
            quantity: Math.max((sizeItem.quantity || 0) - item.quantity, 0)
          }
        }

        return sizeItem
      })

      await axios.patch(`http://localhost:3000/products/${item.productId}`, {
        sizes: updatedSizes
      })
    }

    await axios.post('http://localhost:3000/orders', orderPayload)

    await axios.patch(`http://localhost:3000/users/${currentUser.id}`, {
      cart: {
        items: [],
        updatedAt: new Date().toISOString()
      }
    })

    router.push('/orders')
  } catch (error) {
    console.error(error)
    checkoutError.value = 'Đặt hàng thất bại, thử lại sau'
  }
}

const handleFakeBankTransfer = async () => {
  try {
    isProcessingBankTransfer.value = true
    showBankQrModal.value = false
    await createOrder()
  } catch (error) {
    console.error(error)
    checkoutError.value = 'Xác nhận thanh toán thất bại, thử lại sau'
  } finally {
    isProcessingBankTransfer.value = false
    bankTransferTimeout.value = null
  }
}

const handleCloseBankQrModal = () => {
  if (bankTransferTimeout.value) {
    clearTimeout(bankTransferTimeout.value)
    bankTransferTimeout.value = null
  }

  showBankQrModal.value = false
  isProcessingBankTransfer.value = false
}

const handlePlaceOrder = async () => {
  checkoutError.value = ''

  const fullName = shippingInfo.fullName.trim()

  if (!fullName) {
    checkoutError.value = 'Vui lòng nhập họ và tên'
    return
  }

  if (fullName.length < 2) {
    checkoutError.value = 'Họ và tên quá ngắn'
    return
  }

  if (!/^[\p{L}\s]+$/u.test(fullName)) {
    checkoutError.value = 'Họ và tên không hợp lệ'
    return
  }

  const phone = shippingInfo.phone.trim()

  if (!phone) {
    checkoutError.value = 'Vui lòng nhập số điện thoại'
    return
  }

  if (!/^(0|\+84)[0-9]{9,10}$/.test(phone)) {
    checkoutError.value = 'Số điện thoại không hợp lệ'
    return
  }

  const address = shippingInfo.address.trim()

  if (!address) {
    checkoutError.value = 'Vui lòng nhập địa chỉ nhận hàng'
    return
  }

  if (address.length < 6) {
    checkoutError.value = 'Địa chỉ nhận hàng quá ngắn'
    return
  }

  const city = shippingInfo.city.trim()

  if (!city) {
    checkoutError.value = 'Vui lòng nhập tỉnh / thành phố'
    return
  }

  if (city.length < 2) {
    checkoutError.value = 'Tỉnh / thành phố không hợp lệ'
    return
  }

  if (!/^[\p{L}\s]+$/u.test(city)) {
    checkoutError.value = 'Tỉnh / thành phố không hợp lệ'
    return
  }

  if (paymentMethod.value === 'banking') {
    bankTransferCode.value = `THANHTOAN${Date.now()}`
    showBankQrModal.value = true

    bankTransferTimeout.value = setTimeout(() => {
      handleFakeBankTransfer()
    }, 6000)

    return
  }

  await createOrder()
}
</script>

<style scoped>
.checkout-page {
  padding: 120px 0 60px;
}

.checkout-title {
  font-size: 32px;
  font-weight: 800;
  color: #111;
  margin-bottom: 28px;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 24px;
  align-items: start;
}

.checkout-left,
.checkout-right {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.checkout-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.checkout-card h2 {
  font-size: 22px;
  font-weight: 700;
  color: #111;
}

@media (max-width: 900px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .checkout-title {
    font-size: 28px;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-top: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 700;
  color: #222;
  letter-spacing: 0.2px;
}

.form-group input {
  width: 100%;
  height: 50px;
  border: 1px solid #d4d4d8;
  border-radius: 14px;
  padding: 0 16px;
  font-size: 15px;
  font-weight: 500;
  color: #111;
  background: #fff;
  outline: none;
  transition: 0.2s ease;
}

.form-group input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.form-group input:focus {
  border-color: #facc15;
  box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.18);
}

.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 20px;
}

.payment-option {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px 18px;
  cursor: pointer;
  transition: 0.2s ease;
}

.payment-option:hover {
  border-color: #facc15;
  background: #fffdf3;
}

.payment-option input {
  margin-top: 4px;
}

.payment-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.payment-name {
  font-size: 16px;
  font-weight: 700;
  color: #111;
}

.payment-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.summary-empty {
  margin-top: 18px;
  font-size: 15px;
  color: #666;
}

.summary-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ececec;
}

.summary-item-info {
  flex: 1;
}

.summary-item-name {
  font-size: 15px;
  font-weight: 700;
  color: #111;
  line-height: 1.6;
  margin-bottom: 4px;
}

.summary-item-meta {
  font-size: 14px;
  color: #666;
}

.summary-item-price {
  font-size: 15px;
  font-weight: 700;
  color: #111;
  white-space: nowrap;
}

.summary-total {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: #333;
}

.summary-row.total {
  padding-top: 14px;
  border-top: 1px solid #e5e7eb;
  font-size: 18px;
  font-weight: 800;
  color: #111;
} 

.place-order-btn {
  width: 100%;
  height: 52px;
  margin-top: 22px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #facc15 0%, #eab308 100%);
  color: #111;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
  box-shadow: 0 10px 22px rgba(234, 179, 8, 0.28);
}

.place-order-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.03);
  box-shadow: 0 14px 28px rgba(234, 179, 8, 0.38);
}

.place-order-btn:active:not(:disabled) {
  transform: translateY(0);
  filter: brightness(0.98);
  box-shadow: 0 6px 14px rgba(234, 179, 8, 0.24);
}

.place-order-btn:disabled {
  background: #f3e7a3;
  color: #7c6f32;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  filter: none;
}

.checkout-error {
  margin-top: 18px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 14px;
  font-weight: 600;
}

.bank-qr-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.55);
}

.bank-qr-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  text-align: center;
}

.bank-qr-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 220px;
  height: 220px;
  margin: 20px auto 0;
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  background: #f9fafb;
  color: #111827;
  font-size: 18px;
  font-weight: 800;
  text-align: center;
}

.bank-transfer-info {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 15px;
  color: #374151;
}

.bank-transfer-info p {
  margin: 0;
}

.bank-qr-note {
  margin-top: 18px;
  font-size: 14px;
  line-height: 1.6;
  color: #6b7280;
  text-align: center;
}

.close-bank-qr-btn {
  width: 100%;
  height: 48px;
  margin-top: 20px;
  border: none;
  border-radius: 14px;
  background: #111827;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.close-bank-qr-btn:hover:not(:disabled) {
  opacity: 0.92;
}

.close-bank-qr-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.bank-qr-modal {
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border-radius: 20px;
  padding: 28px 28px 24px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.22);
}

.bank-qr-image {
  display: block;
  width: 320px;
  height: 320px;
  margin: 24px auto 8px;
  border-radius: 16px;
  background: #f9fafb;
}
</style>