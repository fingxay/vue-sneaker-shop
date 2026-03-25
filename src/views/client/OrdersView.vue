<template>
  <div class="orders-page">
    <div class="container">
      <h1 class="orders-title">Hóa đơn</h1>

      <div v-if="loading" class="orders-empty">
        <div class="orders-empty-box">
          <h2>Đang tải hóa đơn...</h2>
        </div>
      </div>

      <div v-else-if="!orders.length" class="orders-empty">
        <div class="orders-empty-box">
          <h2>Chưa có hóa đơn nào</h2>
          <p>Đơn hàng của bạn sau này sẽ hiện ở đây.</p>
        </div>
      </div>

      <div v-else class="orders-list">
        <div
          v-for="order in orders"
          :key="order.id"
          class="order-card"
        >
          <div class="order-top">
            <div>
              <p class="order-code">Mã đơn: #{{ order.id }}</p>
              <p class="order-date">Ngày đặt: {{ formatDate(order.createdAt) }}</p>
            </div>

            <div class="order-status" :class="`status-${order.status}`">
              {{ formatOrderStatus(order.status) }}
            </div>
          </div>

          <button
            type="button"
            class="toggle-customer-btn"
            @click="toggleCustomerInfo(order.id)"
          >
            {{ isCustomerInfoExpanded(order.id) ? 'Ẩn thông tin nhận hàng' : 'Xem thông tin nhận hàng' }}
          </button>

          <div v-if="isCustomerInfoExpanded(order.id)" class="order-customer">
            <p><strong>Người nhận:</strong> {{ order.customerInfo?.fullName }}</p>
            <p><strong>Số điện thoại:</strong> {{ order.customerInfo?.phone }}</p>
            <p><strong>Thanh toán:</strong> {{ order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng' }}</p>
            <p>
              <strong>Địa chỉ:</strong>
              {{ order.customerInfo?.address }}, {{ order.customerInfo?.city }}
            </p>
            <p v-if="order.customerInfo?.note">
              <strong>Ghi chú:</strong> {{ order.customerInfo.note }}
            </p>
          </div>

          <div class="order-items">
            <div
              v-for="item in order.items"
              :key="`${order.id}-${item.productId}-${item.size}`"
              class="order-item"
            >
              <div class="order-item-left">
                <img
                  :src="require(`@/assets/sneakers/${item.image}`)"
                  :alt="item.name"
                  class="order-item-image"
                />

                <div>
                  <p class="order-item-name">{{ item.name }}</p>
                  <p class="order-item-meta">Size: {{ item.size }} × {{ item.quantity }}</p>
                </div>
              </div>

              <p class="order-item-price">
                {{ formatPrice(item.price * item.quantity) }}
              </p>
            </div>
          </div>

          <div class="order-bottom">
            <div class="order-summary">
              <p>Tạm tính: <strong>{{ formatPrice(order.subtotal) }}</strong></p>
              <p>Phí vận chuyển: <strong>{{ formatPrice(order.shippingFee) }}</strong></p>
              <p class="order-total">Tổng cộng: <strong>{{ formatPrice(order.totalAmount) }}</strong></p>
            </div>

            <button
              v-if="order.status === 'pending'"
              type="button"
              class="cancel-order-btn"
              @click="confirmCancelOrder(order)"
            >
              Hủy đơn
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const expandedCustomerIds = ref([])
const orders = ref([])
const loading = ref(false)

const toggleCustomerInfo = (orderId) => {
  if (expandedCustomerIds.value.includes(orderId)) {
    expandedCustomerIds.value = expandedCustomerIds.value.filter((id) => id !== orderId)
    return
  }

  expandedCustomerIds.value.push(orderId)
}

const isCustomerInfoExpanded = (orderId) => {
  return expandedCustomerIds.value.includes(orderId)
}

const formatPrice = (price) => {
  if (!price) return '0đ'
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

const confirmCancelOrder = (order) => {
  const isConfirmed = window.confirm('Bạn có chắc muốn hủy đơn hàng này không?')

  if (!isConfirmed) return

  handleCancelOrder(order)
}

const handleCancelOrder = async (order) => {
  try {
    for (const item of order.items) {
      const productRes = await axios.get(`http://localhost:3000/products/${item.productId}`)
      const product = productRes.data

      const updatedSizes = product.sizes.map((sizeItem) => {
        if (sizeItem.size === item.size) {
          return {
            ...sizeItem,
            quantity: (sizeItem.quantity || 0) + item.quantity
          }
        }

        return sizeItem
      })

      await axios.patch(`http://localhost:3000/products/${item.productId}`, {
        sizes: updatedSizes
      })
    }

    await axios.patch(`http://localhost:3000/orders/${order.id}`, {
      status: 'cancelled'
    })

    await fetchOrders()
  } catch (error) {
    console.error(error)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('vi-VN')
}

const fetchOrders = async () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))
  if (!currentUser) {
    orders.value = []
    return
  }

  try {
    loading.value = true

    const res = await axios.get(`http://localhost:3000/orders?userId=${currentUser.id}`)
    orders.value = res.data.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
  } catch (error) {
    console.error(error)
    orders.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrders()
})

const formatOrderStatus = (status) => {
  if (status === 'pending') return 'Chờ xác nhận'
  if (status === 'confirmed') return 'Đã xác nhận'
  if (status === 'shipping') return 'Đang giao'
  if (status === 'completed') return 'Hoàn thành'
  if (status === 'cancelled') return 'Đã hủy'
  return status
}
</script>

<style scoped>
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 60px;
}

.order-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.order-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding-bottom: 18px;
  border-bottom: 1px solid #ececec;
}

.order-code {
  font-size: 18px;
  font-weight: 800;
  color: #111;
  margin-bottom: 6px;
}

.order-date {
  font-size: 14px;
  color: #666;
}

.order-status {
  padding: 8px 14px;
  border-radius: 999px;
  background: #fff7d6;
  color: #a16207;
  font-size: 14px;
  font-weight: 700;
  text-transform: capitalize;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.order-item-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.order-item-image {
  width: 84px;
  height: 84px;
  object-fit: cover;
  border-radius: 14px;
  background: #f5f5f5;
  flex-shrink: 0;
}

.order-item-name {
  font-size: 16px;
  font-weight: 700;
  color: #111;
  line-height: 1.6;
  margin-bottom: 4px;
}

.order-item-meta {
  font-size: 14px;
  color: #666;
}

.order-item-price {
  font-size: 15px;
  font-weight: 700;
  color: #111;
  white-space: nowrap;
}

.order-bottom {
  padding-top: 18px;
  border-top: 1px solid #ececec;
}

.order-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 15px;
  color: #333;
}

.order-total {
  font-size: 18px;
  color: #111;
}

@media (max-width: 768px) {
  .orders-title {
    font-size: 28px;
  }

  .order-card {
    padding: 18px;
  }

  .order-top,
  .order-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-item-left {
    align-items: flex-start;
  }

  .order-item-image {
    width: 72px;
    height: 72px;
  }
}

.order-status.status-pending {
  background: #fff7d6;
  color: #a16207;
}

.order-status.status-confirmed {
  background: #dbeafe;
  color: #1d4ed8;
}

.order-status.status-shipping {
  background: #ede9fe;
  color: #7c3aed;
}

.order-status.status-completed {
  background: #dcfce7;
  color: #15803d;
}

.order-status.status-cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.order-customer {
  padding: 16px 0 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #444;
  line-height: 1.7;
}

.cancel-order-btn {
  margin-top: 16px;
  min-width: 140px;
  height: 42px;
  padding: 0 16px;
  border: none;
  border-radius: 12px;
  background: #dc2626;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.cancel-order-btn:hover {
  opacity: 0.92;
}

.toggle-customer-btn {
  margin-top: 16px;
  padding: 0;
  border: none;
  background: transparent;
  color: #ca8a04;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.toggle-customer-btn:hover {
  color: #a16207;
  text-decoration: underline;
}
</style>