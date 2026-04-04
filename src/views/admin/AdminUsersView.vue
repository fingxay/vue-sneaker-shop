<template>
  <div class="admin-users-page">
    <div class="users-page-header">
      <div>
        <p class="users-page-eyebrow">User Management</p>
        <h2 class="users-page-title">Quản lý người dùng</h2>
        <p class="users-page-desc">
          Theo dõi danh sách tài khoản người dùng trong hệ thống.
        </p>
      </div>
    </div>

    <div class="users-toolbar">
      <div class="users-search-wrap">
        <input
          v-model.trim="searchText"
          type="text"
          class="users-search-input"
          placeholder="Tìm theo tên hoặc email..."
        />
      </div>
    </div>

    <div class="users-table-card">
      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Đơn hàng</th>
              <th>Giỏ hàng</th>
              <th>Địa chỉ giao hàng</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="!filteredUsers.length">
              <td colspan="7" class="empty-cell">Không có người dùng phù hợp</td>
            </tr>

            <tr v-for="user in filteredUsers" :key="user.id">
              <td>#{{ user.id }}</td>
              <td>{{ user.name || '---' }}</td>
              <td>{{ user.email || '---' }}</td>
              <td>
                <div class="order-cell">
                  <span>{{ getOrderCount(user.id) }} đơn</span>
                  <button
                    type="button"
                    class="view-order-btn"
                    @click="openUserOrdersModal(user)"
                  >
                    Xem
                  </button>
                </div>
              </td>
              <td>{{ getCartCount(user) }} sản phẩm</td>
              <td>{{ formatShippingInfo(user.shippingInfo) }}</td>
              <td>
                <div class="user-actions">
                  <button
                    type="button"
                    class="lock-user-btn"
                    @click="handleUserStatusClick(user)"
                  >
                    {{ user.isActive ? 'Khóa' : 'Mở khóa' }}
                  </button>

                  <button
                    type="button"
                    class="delete-user-btn"
                    @click="openDeleteModal(user)"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div
    v-if="isOrdersModalOpen"
    class="user-orders-modal-overlay"
    @click.self="closeUserOrdersModal"
  >
    <div class="user-orders-modal">
      <div class="user-orders-modal-header">
        <div>
          <h3 class="user-orders-modal-title">
            Đơn hàng của {{ selectedUserName }}
          </h3>
          <p class="user-orders-modal-desc">
            Tổng số đơn: {{ selectedUserOrders.length }}
          </p>
        </div>

        <button
          type="button"
          class="user-orders-modal-close"
          @click="closeUserOrdersModal"
        >
          ×
        </button>
      </div>

      <div v-if="!selectedUserOrders.length" class="user-orders-empty">
        Người dùng này chưa có đơn hàng nào
      </div>

      <div v-else class="user-orders-list">
        <div
          v-for="order in selectedUserOrders"
          :key="order.id"
          class="user-order-card"
        >
          <p><strong>Mã đơn:</strong> #{{ order.id }}</p>
          <p><strong>Trạng thái:</strong> {{ order.status }}</p>
          <p><strong>Tổng tiền:</strong> {{ order.totalAmount }}</p>
        </div>
      </div>
    </div>
  </div>

  <BaseConfirmModal
    :isOpen="isDeleteModalOpen"
    title="Xóa tài khoản"
    message="Bạn có chắc muốn xóa tài khoản này không?"
    confirmText="Xóa"
    cancelText="Hủy"
    variant="danger"
    @confirm="confirmDeleteUser"
    @cancel="closeDeleteModal"
  />

  <BaseConfirmModal
  :isOpen="isLockModalOpen"
  title="Khóa tài khoản"
  message="Bạn có chắc muốn khóa tài khoản này không? Hệ thống sẽ hủy các đơn pending / confirmed / shipping và hoàn lại tồn kho."
  confirmText="Khóa tài khoản"
  cancelText="Hủy"
  variant="warning"
  @confirm="confirmLockUser"
  @cancel="closeLockModal"
/>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue'

const users = ref([])
const orders = ref([])
const searchText = ref('')
const isDeleteModalOpen = ref(false)
const selectedUserToDelete = ref(null)
const isOrdersModalOpen = ref(false)
const selectedUserOrders = ref([])
const selectedUserName = ref('')
const isLockModalOpen = ref(false)
const selectedUserToLock = ref(null)

const filteredUsers = computed(() => {
  const keyword = searchText.value.toLowerCase()

  return users.value.filter((user) => {
    if (user.role === 'admin') return false

    const name = (user.name || '').toLowerCase()
    const email = (user.email || '').toLowerCase()

    return name.includes(keyword) || email.includes(keyword)
  })
})

const getCartCount = (user) => {
  return user?.cart?.items?.length || 0
}

const getOrderCount = (userId) => {
  return orders.value.filter(
    (order) => order.userId === userId && order.status !== 'cancelled'
  ).length
}

const formatShippingInfo = (shippingInfo) => {
  if (!shippingInfo) return 'Chưa có thông tin'

  const parts = [
    shippingInfo.fullName,
    shippingInfo.phone,
    shippingInfo.address,
    shippingInfo.city
  ].filter(Boolean)

  return parts.length ? parts.join(' - ') : 'Chưa có thông tin'
}

const loadUsers = async () => {
  try {
    const [usersRes, ordersRes] = await Promise.all([
      axios.get('http://localhost:3000/users'),
      axios.get('http://localhost:3000/orders')
    ])

    users.value = usersRes.data || []
    orders.value = ordersRes.data || []
  } catch (error) {
    console.error('Lỗi load users:', error)
  }
}

const restoreInventoryForOrder = async (order) => {
  const productsRes = await axios.get('http://localhost:3000/products')
  const products = productsRes.data || []

  for (const item of order.items || []) {
    const product = products.find((productItem) => productItem.id === item.productId)

    if (!product) continue

    const updatedSizes = (product.sizes || []).map((sizeItem) => {
      if (sizeItem.size !== item.size) return sizeItem

      const currentQuantity = Number(sizeItem.quantity) || 0

      return {
        ...sizeItem,
        quantity: currentQuantity + item.quantity
      }
    })

    await axios.patch(`http://localhost:3000/products/${product.id}`, {
      sizes: updatedSizes
    })
  }
}

const handleUserStatusClick = (user) => {
  if (user.isActive) {
    selectedUserToLock.value = user
    isLockModalOpen.value = true
    return
  }

  toggleUserStatus(user)
}

const closeLockModal = () => {
  isLockModalOpen.value = false
  selectedUserToLock.value = null
}

const confirmLockUser = async () => {
  if (!selectedUserToLock.value) return

  const user = selectedUserToLock.value
  closeLockModal()
  await toggleUserStatus(user)
}

const toggleUserStatus = async (user) => {
  try {
    const nextStatus = !user.isActive

    await axios.patch(`http://localhost:3000/users/${user.id}`, {
      isActive: nextStatus
    })

    if (!nextStatus) {
      const userActiveOrders = orders.value.filter((order) => {
        return (
          order.userId === user.id &&
          ['pending', 'confirmed', 'shipping'].includes(order.status)
        )
      })

      for (const order of userActiveOrders) {
        await restoreInventoryForOrder(order)

        await axios.patch(`http://localhost:3000/orders/${order.id}`, {
          status: 'cancelled'
        })

        selectedUserOrders.value = selectedUserOrders.value.map((order) => {
          if (
            order.userId === user.id &&
            ['pending', 'confirmed', 'shipping'].includes(order.status)
          ) {
            return {
              ...order,
              status: 'cancelled'
            }
          }

          return order
        })
      }
    }

    await loadUsers()
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái user:', error)
  }
}

const openDeleteModal = (user) => {
  selectedUserToDelete.value = user
  isDeleteModalOpen.value = true
}

const openUserOrdersModal = (user) => {
  selectedUserName.value = user.name || user.email || 'Người dùng'
  selectedUserOrders.value = orders.value.filter(
    (order) => order.userId === user.id
  )
  isOrdersModalOpen.value = true
}

const closeUserOrdersModal = () => {
  isOrdersModalOpen.value = false
  selectedUserOrders.value = []
  selectedUserName.value = ''
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  selectedUserToDelete.value = null
}

const confirmDeleteUser = async () => {
  if (!selectedUserToDelete.value) return

  const userId = selectedUserToDelete.value.id
  closeDeleteModal()

  try {
    await axios.delete(`http://localhost:3000/users/${userId}`)
    await loadUsers()
  } catch (error) {
    console.error('Lỗi xóa user:', error)
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-users-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.users-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.users-page-eyebrow {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #2563eb;
  margin: 0 0 8px;
}

.users-page-title {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px;
}

.users-page-desc {
  font-size: 15px;
  color: #64748b;
  margin: 0;
}

.users-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.users-search-wrap {
  width: 100%;
  max-width: 420px;
}

.users-search-input {
  width: 100%;
  height: 46px;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  padding: 0 16px;
  font-size: 14px;
  color: #0f172a;
  background: #ffffff;
  outline: none;
}

.users-search-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.users-table-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.users-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.users-table thead {
  background: #f8fafc;
}

.users-table th {
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  padding: 16px 18px;
  border-bottom: 1px solid #e2e8f0;
}

.users-table td {
  font-size: 14px;
  color: #0f172a;
  padding: 16px 18px;
  border-bottom: 1px solid #eef2f7;
  vertical-align: top;
}

.empty-cell {
  text-align: center;
  color: #94a3b8;
  padding: 28px 16px !important;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 74px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
}

.user-role {
  background: #dbeafe;
  color: #1d4ed8;
}

.admin-role {
  background: #fee2e2;
  color: #dc2626;
}

@media (max-width: 768px) {
  .users-page-title {
    font-size: 26px;
  }

  .users-search-wrap {
    max-width: 100%;
  }
}

.order-cell {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.view-order-btn,
.lock-user-btn,
.delete-user-btn {
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.view-order-btn {
  background: #dbeafe;
  color: #1d4ed8;
}

.view-order-btn:hover {
  background: #bfdbfe;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.lock-user-btn {
  background: #fef3c7;
  color: #b45309;
}

.lock-user-btn:hover {
  background: #fde68a;
}

.delete-user-btn {
  background: #fee2e2;
  color: #dc2626;
}

.delete-user-btn:hover {
  background: #fecaca;
}

.user-orders-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.55);
}

.user-orders-modal {
  width: 100%;
  max-width: 720px;
  max-height: 85vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.22);
}

.user-orders-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.user-orders-modal-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #111827;
}

.user-orders-modal-desc {
  margin: 8px 0 0;
  font-size: 14px;
  color: #6b7280;
}

.user-orders-modal-close {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 999px;
  background: #f3f4f6;
  color: #111827;
  font-size: 24px;
  cursor: pointer;
}

.user-orders-empty {
  font-size: 15px;
  color: #6b7280;
}

.user-orders-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.user-order-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  background: #f9fafb;
}

.user-order-card p {
  margin: 0 0 8px;
  font-size: 14px;
  color: #111827;
}

.user-order-card p:last-child {
  margin-bottom: 0;
}
</style>