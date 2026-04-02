<template>
  <div class="admin-orders-page">
    <div v-if="saveSuccessMessage" class="admin-success-toast">
      {{ saveSuccessMessage }}
    </div>

    <div class="admin-order-filters">
      <button
        type="button"
        class="admin-order-filter-btn"
        :class="{ active: selectedStatus === 'all' }"
        @click="handleChangeStatus('all')"
      >
        Tất cả
      </button>

      <button
        type="button"
        class="admin-order-filter-btn"
        :class="{ active: selectedStatus === 'pending' }"
        @click="handleChangeStatus('pending')"
      >
        Chờ xác nhận
      </button>

      <button
        type="button"
        class="admin-order-filter-btn"
        :class="{ active: selectedStatus === 'confirmed' }"
        @click="handleChangeStatus('confirmed')"
      >
        Đã xác nhận
      </button>

      <button
        type="button"
        class="admin-order-filter-btn"
        :class="{ active: selectedStatus === 'shipping' }"
        @click="handleChangeStatus('shipping')"
      >
        Đang giao
      </button>

      <button
        type="button"
        class="admin-order-filter-btn"
        :class="{ active: selectedStatus === 'completed' }"
        @click="handleChangeStatus('completed')"
      >
        Hoàn thành
      </button>

      <button
        type="button"
        class="admin-order-filter-btn"
        :class="{ active: selectedStatus === 'cancelled' }"
        @click="handleChangeStatus('cancelled')"
      >
        Đã hủy
      </button>
    </div>

    <div class="admin-order-search">
      <BaseSearchBox
        v-model="searchKeyword"
        placeholder="Tìm theo mã đơn..."
        buttonText="Tìm"
        @search="handleSearchOrder"
      />
    </div>

    <div v-if="loading" class="admin-empty-state">
      Đang tải đơn hàng...
    </div>

    <div v-else-if="!filteredOrders.length" class="admin-empty-state">
      {{ appliedSearchKeyword ? 'Không tìm thấy mã đơn phù hợp' : 'Chưa có đơn hàng nào' }}
    </div>

    <div v-else>
      <div class="admin-orders-list">
        <div
          v-for="order in paginatedOrders"
          :key="order.id"
          class="admin-order-card"
        >
          <div class="admin-order-top">
            <div>
              <p class="admin-order-code">Mã đơn: #{{ order.id }}</p>
              <p class="admin-order-date">Ngày đặt: {{ formatDate(order.createdAt) }}</p>
              <p v-if="order.completedAt" class="admin-order-date">
                Hoàn thành lúc: {{ formatDate(order.completedAt) }}
              </p>
              <p class="admin-order-user">User ID: {{ order.userId }}</p>
            </div>

            <div class="admin-order-status-wrap">

              <div class="admin-order-actions">
                <select
                  class="admin-order-select"
                  :class="`status-${order.tempStatus}`"
                  v-model="order.tempStatus"
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="shipping">Đang giao</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>

                <button
                  type="button"
                  class="admin-order-save-btn"
                  @click="handleStatusChange(order)"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>

          <div class="admin-order-info">
            <p><strong>Người nhận:</strong> {{ order.customerInfo?.fullName || '---' }}</p>
            <p><strong>SĐT:</strong> {{ order.customerInfo?.phone || '---' }}</p>
            <p>
              <strong>Địa chỉ:</strong>
              {{ order.customerInfo?.address || '---' }},
              {{ order.customerInfo?.city || '---' }}
            </p>
            <p><strong>Thanh toán:</strong> {{ order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản' }}</p>
            <p><strong>Tổng tiền:</strong> {{ formatPrice(order.totalAmount) }}</p>
          </div>

          <div class="admin-order-items">
            <p class="admin-order-items-title">Sản phẩm:</p>

            <div
              v-for="item in order.items"
              :key="`${order.id}-${item.productId}-${item.size}`"
              class="admin-order-item"
            >
              <div class="admin-order-item-left">
                <img
                  :src="require(`@/assets/sneakers/${item.image}`)"
                  :alt="item.name"
                  class="admin-order-item-image"
                />

                <span>{{ item.name }}</span>
              </div>

              <span>Size {{ item.size }} × {{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>

      <BasePagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        @change-page="handleChangePage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import BasePagination from '@/components/common/BasePagination.vue'
import BaseSearchBox from '@/components/common/BaseSearchBox.vue'

const orders = ref([])
const loading = ref(false)
const selectedStatus = ref('all')
const currentPage = ref(1)
const itemsPerPage = 5
const saveSuccessMessage = ref('')
const searchKeyword = ref('')
const appliedSearchKeyword = ref('')

const filteredOrders = computed(() => {
  let result = orders.value

  if (selectedStatus.value !== 'all') {
    result = result.filter((order) => order.status === selectedStatus.value)
  }

  if (appliedSearchKeyword.value.trim()) {
    const keyword = appliedSearchKeyword.value.trim().toLowerCase()

    result = result.filter((order) =>
      String(order.id).toLowerCase().includes(keyword)
    )
  }

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / itemsPerPage) || 1
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredOrders.value.slice(start, end)
})

const handleChangeStatus = (status) => {
  selectedStatus.value = status
  currentPage.value = 1
}

const handleSearchOrder = () => {
  appliedSearchKeyword.value = searchKeyword.value
  currentPage.value = 1
}

const handleChangePage = (page) => {
  currentPage.value = page
}

const handleStatusChange = async (order) => {
  try {
    const patchData = {
      status: order.tempStatus
    }

    if (order.tempStatus === 'completed' && order.status !== 'completed') {
      patchData.completedAt = new Date().toISOString()
    }

    if (order.tempStatus !== 'completed') {
      patchData.completedAt = null
    }

    await axios.patch(`http://localhost:3000/orders/${order.id}`, patchData)

    order.status = order.tempStatus
    order.completedAt = patchData.completedAt ?? order.completedAt

    saveSuccessMessage.value = `Đã lưu trạng thái đơn #${order.id} thành công`

    setTimeout(() => {
      saveSuccessMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error(error)
  }
}

const fetchOrders = async () => {
  try {
    loading.value = true

    const res = await axios.get('http://localhost:3000/orders')

    orders.value = res.data
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((order) => ({
        ...order,
        tempStatus: order.status
      }))
  } catch (error) {
    console.error(error)
    orders.value = []
  } finally {
    loading.value = false
  }
}

const formatPrice = (price) => {
  if (!price) return '0đ'
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('vi-VN')
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.admin-page-title {
  font-size: 40px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 24px;
}

.admin-empty-state {
  padding: 24px;
  border-radius: 16px;
  background: #ffffff;
  color: #6b7280;
  font-weight: 600;
}

.admin-orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.admin-order-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.admin-order-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.admin-order-code {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 6px;
}

.admin-order-date,
.admin-order-user {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.admin-order-info {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #374151;
}

.admin-order-items {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.admin-order-items-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
}

.admin-order-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
}

.admin-order-item:last-child {
  border-bottom: none;
}

.admin-order-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.admin-order-search {
  margin-bottom: 24px;
}

.admin-order-filter-btn {
  padding: 10px 18px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.admin-order-filter-btn:hover {
  border-color: #facc15;
  color: #111827;
}

.admin-order-filter-btn.active {
  background: #facc15;
  border-color: #facc15;
  color: #111827;
}

.admin-order-status-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.admin-order-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-order-select {
  min-width: 170px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  color: #111827;
  font-size: 14px;
  font-weight: 600;
  outline: none;
}

.admin-order-select.status-pending {
  background: #fef3c7;
  color: #92400e;
  border-color: #f59e0b;
}

.admin-order-select.status-confirmed {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: #60a5fa;
}

.admin-order-select.status-shipping {
  background: #ede9fe;
  color: #7c3aed;
  border-color: #a78bfa;
}

.admin-order-select.status-completed {
  background: #dcfce7;
  color: #15803d;
  border-color: #4ade80;
}

.admin-order-select.status-cancelled {
  background: #fee2e2;
  color: #dc2626;
  border-color: #f87171;
}

.admin-order-select:focus {
  border-color: #facc15;
}

.admin-order-save-btn {
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  background: #111827;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.admin-order-save-btn:hover {
  opacity: 0.92;
}

.admin-order-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.admin-order-item-image {
  width: 76px;
  height: 7 6px;
  object-fit: cover;
  border-radius: 12px;
  background: #f5f5f5;
  flex-shrink: 0;
}

.admin-success-toast {
  margin-bottom: 20px;
  padding: 14px 18px;
  border-radius: 14px;
  background: #dcfce7;
  color: #15803d;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(22, 163, 74, 0.12);
}
</style>