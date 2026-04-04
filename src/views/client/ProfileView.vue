<template>
  <div class="profile-page">
    <div class="container">
      <div v-if="currentUser" class="profile-card">
        <div class="profile-top">
          <div class="profile-avatar">
            {{ avatarText }}
          </div>

          <div class="profile-intro">
            <p class="profile-label">Tài khoản của tôi</p>
            <h1 class="profile-name">{{ currentUser.name }}</h1>
            <p class="profile-email">{{ currentUser.email }}</p>
          </div>
        </div>

        <div class="profile-info-list">
          <div class="profile-info-item">
            <span class="info-title">Họ và tên</span>
            <span class="info-value">{{ currentUser.name }}</span>
          </div>

          <div class="profile-info-item">
            <span class="info-title">Email</span>
            <span class="info-value">{{ currentUser.email }}</span>
          </div>

          <div class="profile-info-item">
            <span class="info-title">Vai trò</span>
            <span class="info-value role-badge">{{ currentUser.role }}</span>
          </div>
        </div>

        <div class="profile-section">
          <h2 class="section-title">Thông tin giao hàng</h2>

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

          <button type="button" class="save-shipping-btn" @click="handleSaveShippingInfo">
            Lưu thông tin giao hàng
          </button>
          <p v-if="shippingMessage" class="shipping-message">
            {{ shippingMessage }}
          </p>
        </div>

        <div class="profile-actions">
          <button type="button" class="logout-btn" @click="openLogoutConfirm">
            Đăng xuất
          </button>
        </div>
      </div>

      <div v-else class="profile-empty">
        <h2>Bạn chưa đăng nhập</h2>
        <p>Đăng nhập để xem thông tin tài khoản của bạn.</p>
        <router-link to="/login" class="go-login-btn">Đi đến đăng nhập</router-link>
      </div>
    </div>

    <BaseConfirmModal
      :isOpen="showLogoutConfirm"
      title="Xác nhận đăng xuất"
      message="Bạn có chắc muốn đăng xuất khỏi tài khoản này không?"
      confirmText="Đăng xuất"
      cancelText="Ở lại"
      variant="warning"
      @confirm="handleLogout"
      @cancel="closeLogoutConfirm"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue'

const shippingMessage = ref('')
const showLogoutConfirm = ref(false)

const shippingInfo = reactive({
  fullName: '',
  phone: '',
  address: '',
  city: '',
  note: ''
})

const handleSaveShippingInfo = async () => {
  if (!currentUser.value?.id) return

  shippingMessage.value = ''

  try {
    await axios.patch(`http://localhost:3000/users/${currentUser.value.id}`, {
      shippingInfo: {
        fullName: shippingInfo.fullName.trim(),
        phone: shippingInfo.phone.trim(),
        address: shippingInfo.address.trim(),
        city: shippingInfo.city.trim(),
        note: shippingInfo.note.trim()
      }
    })

    shippingMessage.value = 'Đã lưu thông tin giao hàng'
    setTimeout(() => {
      shippingMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error(error)
    shippingMessage.value = 'Lưu thông tin thất bại'
    setTimeout(() => {
      shippingMessage.value = ''
    }, 3000)
  }
}

const currentUser = ref(null)
const router = useRouter()

const getCurrentUser = () => {
  const storedUser = localStorage.getItem('currentUser')

  if (storedUser) {
    currentUser.value = JSON.parse(storedUser)
  } else {
    currentUser.value = null
  }
}

const fetchUserShippingInfo = async () => {
  if (!currentUser.value?.id) return

  try {
    const res = await axios.get(`http://localhost:3000/users/${currentUser.value.id}`)
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

const openLogoutConfirm = () => {
  showLogoutConfirm.value = true
}

const closeLogoutConfirm = () => {
  showLogoutConfirm.value = false
}

const handleLogout = () => {
  localStorage.removeItem('currentUser')
  currentUser.value = null
  showLogoutConfirm.value = false
  router.push('/login')
}

const avatarText = computed(() => {
  if (!currentUser.value?.name) return '?'

  return currentUser.value.name
    .trim()
    .split(' ')
    .slice(-2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
})

onMounted(async () => {
  getCurrentUser()
  await fetchUserShippingInfo()
})
</script>

<style scoped>
.profile-page {
  padding: 120px 0 60px;
}

.profile-card {
  max-width: 760px;
  margin: 0 auto;
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.profile-top {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.profile-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: #facc15;
  color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  flex-shrink: 0;
}

.profile-label {
  font-size: 14px;
  font-weight: 600;
  color: #888;
  margin-bottom: 8px;
}

.profile-name {
  font-size: 32px;
  font-weight: 700;
  color: #111;
  margin-bottom: 8px;
}

.profile-email {
  font-size: 16px;
  color: #666;
}

.profile-info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 28px;
}

.profile-info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border: 1px solid #eee;
  border-radius: 16px;
  background: #fafafa;
}

.info-title {
  font-size: 14px;
  font-weight: 600;
  color: #777;
}

.info-value {
  font-size: 15px;
  font-weight: 700;
  color: #111;
  text-align: right;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: #111;
  color: #fff;
  text-transform: capitalize;
}

.profile-actions {
  margin-top: 28px;
  display: flex;
  justify-content: flex-end;
}

.logout-btn {
  height: 46px;
  border: none;
  border-radius: 12px;
  padding: 0 20px;
  background: #dc2626;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.logout-btn:hover {
  opacity: 0.92;
}

.profile-empty {
  max-width: 560px;
  margin: 0 auto;
  background: #fff;
  border-radius: 24px;
  padding: 40px 24px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.profile-empty h2 {
  font-size: 28px;
  color: #111;
  margin-bottom: 12px;
}

.profile-empty p {
  font-size: 15px;
  color: #666;
  margin-bottom: 20px;
}

.go-login-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  background: #facc15;
  color: #111;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 100px 0 40px;
  }

  .profile-card {
    padding: 22px 16px;
    border-radius: 18px;
  }

  .profile-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-name {
    font-size: 26px;
  }

  .profile-info-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-value {
    text-align: left;
  }

  .profile-actions {
    justify-content: stretch;
  }

  .logout-btn {
    width: 100%;
  }
}

.profile-section {
  margin-top: 28px;
  padding-top: 28px;
  border-top: 1px solid #ececec;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #111;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
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
}

.form-group input {
  width: 100%;
  height: 48px;
  border: 1px solid #d4d4d8;
  border-radius: 14px;
  padding: 0 16px;
  font-size: 15px;
  color: #111;
  outline: none;
  transition: 0.2s ease;
}

.form-group input:focus {
  border-color: #facc15;
  box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.18);
}

.full-width {
  grid-column: 1 / -1;
}

.save-shipping-btn {
  margin-top: 18px;
  min-width: 220px;
  height: 46px;
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  background: #facc15;
  color: #111;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.save-shipping-btn:hover {
  opacity: 0.92;
}

.shipping-message {
  margin-top: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #16a34a;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }

  .save-shipping-btn {
    width: 100%;
  }
}
</style>