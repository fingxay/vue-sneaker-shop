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

        <div class="profile-actions">
          <button type="button" class="logout-btn" @click="handleLogout">
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
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

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

const handleLogout = () => {
  localStorage.removeItem('currentUser')
  currentUser.value = null
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

onMounted(() => {
  getCurrentUser()
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
</style>