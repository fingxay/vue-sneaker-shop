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
                <div
                  class="status-dropdown"
                  :ref="(el) => setDropdownRef(order.id, el)"
                >
                  <button
                    type="button"
                    class="status-dropdown-trigger"
                    :class="`status-${order.tempStatus}`"
                    @click="toggleStatusDropdown(order.id)"
                  >
                    <span>{{ getStatusLabel(order.tempStatus) }}</span>
                    <span
                      class="status-dropdown-arrow"
                      :class="{ open: openDropdownId === order.id }"
                    >
                      ▼
                    </span>
                  </button>

                  <div
                    v-if="openDropdownId === order.id"
                    class="status-dropdown-menu"
                  >
                    <button
                      v-for="status in statusOptions"
                      :key="status.value"
                      type="button"
                      class="status-dropdown-item"
                      :class="[
                        `status-${status.value}`,
                        { active: order.tempStatus === status.value }
                      ]"
                      @click="handleStatusOptionClick(order, status.value)"
                    >
                      {{ status.label }}
                    </button>
                  </div>
                </div>
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

  <BaseConfirmModal
    :isOpen="isStatusConfirmOpen"
    title="Xác nhận chuyển trạng thái"
    :message="`Bạn có chắc muốn chuyển đơn #${selectedOrderToConfirm?.id || ''} sang trạng thái ${getStatusLabel(pendingStatusValue)} không?`"
    :confirmText="`Chuyển sang ${getStatusLabel(pendingStatusValue)}`"
    cancelText="Hủy"
    :variant="getStatusConfirmVariant(pendingStatusValue)"
    @confirm="confirmStatusChange"
    @cancel="closeStatusConfirm"
  />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import BasePagination from '@/components/common/BasePagination.vue'
import BaseSearchBox from '@/components/common/BaseSearchBox.vue'
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue'

const orders = ref([])
const loading = ref(false)
const selectedStatus = ref('all')
const currentPage = ref(1)
const itemsPerPage = 5
const saveSuccessMessage = ref('')
const searchKeyword = ref('')
const appliedSearchKeyword = ref('')
const isStatusConfirmOpen = ref(false)
const selectedOrderToConfirm = ref(null)
const pendingStatusValue = ref('')
const openDropdownId = ref(null)
const dropdownRefs = ref({})

const statusOptions = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' }
]

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

const setDropdownRef = (orderId, el) => {
  if (el) {
    dropdownRefs.value[orderId] = el
  } else {
    delete dropdownRefs.value[orderId]
  }
}

const toggleStatusDropdown = (orderId) => {
  openDropdownId.value = openDropdownId.value === orderId ? null : orderId
}

const handleClickOutside = (event) => {
  if (!openDropdownId.value) return

  const currentDropdown = dropdownRefs.value[openDropdownId.value]

  if (currentDropdown && !currentDropdown.contains(event.target)) {
    openDropdownId.value = null
  }
}

const confirmStatusChange = async () => {
  if (!selectedOrderToConfirm.value || !pendingStatusValue.value) return

  const order = selectedOrderToConfirm.value
  const newStatus = pendingStatusValue.value

  isStatusConfirmOpen.value = false
  selectedOrderToConfirm.value = null
  pendingStatusValue.value = ''

  await handleStatusChange(order, newStatus)
}

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

const getStatusLabel = (status) => {
  const statusMap = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }

  return statusMap[status] || status
}

const getStatusConfirmVariant = (status) => {
  if (status === 'confirmed') return 'info'
  if (status === 'shipping') return 'purple'
  if (status === 'completed') return 'success'
  if (status === 'cancelled') return 'danger'
  return 'warning'
}

const handleStatusOptionClick = (order, newStatus) => {
  openDropdownId.value = null

  if (newStatus === order.status) {
    order.tempStatus = order.status
    return
  }

  order.tempStatus = newStatus
  selectedOrderToConfirm.value = order
  pendingStatusValue.value = newStatus
  isStatusConfirmOpen.value = true
}

const closeStatusConfirm = () => {
  if (selectedOrderToConfirm.value) {
    selectedOrderToConfirm.value.tempStatus = selectedOrderToConfirm.value.status
  }

  isStatusConfirmOpen.value = false
  selectedOrderToConfirm.value = null
  pendingStatusValue.value = ''
}

const handleStatusChange = async (order, newStatus) => {
  try {
    const patchData = {
      status: newStatus
    }

    if (newStatus === 'completed' && order.status !== 'completed') {
      patchData.completedAt = new Date().toISOString()
    }

    if (newStatus !== 'completed') {
      patchData.completedAt = null
    }

    await axios.patch(`http://localhost:3000/orders/${order.id}`, patchData)

    order.status = newStatus
    order.tempStatus = newStatus
    order.completedAt = patchData.completedAt

    saveSuccessMessage.value = `Đã lưu trạng thái đơn #${order.id} thành công`

    setTimeout(() => {
      saveSuccessMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error(error)
    order.tempStatus = order.status
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
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
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

.status-dropdown {
  position: relative;
  min-width: 190px;
}

.status-dropdown-trigger {
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  outline: none;
  transition: 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.06);
}

.status-dropdown-trigger:hover {
  transform: translateY(-1px);
}

.status-dropdown-arrow {
  font-size: 12px;
  transition: 0.2s ease;
  flex-shrink: 0;
}

.status-dropdown-arrow.open {
  transform: rotate(180deg);
}

.status-dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  width: 100%;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
  z-index: 50;
  animation: dropdownFadeIn 0.18s ease;
}

.status-dropdown-item {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  border-radius: 12px;
  padding: 11px 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.18s ease;
  margin-bottom: 4px;
}

.status-dropdown-item:last-child {
  margin-bottom: 0;
}

.status-dropdown-item:hover {
  transform: translateX(2px);
}

.status-dropdown-item.active {
  box-shadow: inset 0 0 0 1px currentColor;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
  border-color: #f59e0b;
}

.status-confirmed {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: #60a5fa;
}

.status-shipping {
  background: #ede9fe;
  color: #7c3aed;
  border-color: #a78bfa;
}

.status-completed {
  background: #dcfce7;
  color: #15803d;
  border-color: #4ade80;
}

.status-cancelled {
  background: #fee2e2;
  color: #dc2626;
  border-color: #f87171;
}

.admin-order-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.admin-order-item-image {
  width: 76px;
  height: 76px;
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

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>