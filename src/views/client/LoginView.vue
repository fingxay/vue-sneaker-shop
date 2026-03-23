<template>
  <div class="auth-page">
    <div class="container">
      <div class="auth-box">
        <h1 class="auth-title">Đăng nhập</h1>

        <form class="auth-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              v-model="email"
              type="email"
              class="form-input"
              placeholder="Nhập email"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Mật khẩu</label>
            <input
              v-model="password"
              type="password"
              class="form-input"
              placeholder="Nhập mật khẩu"
            />
          </div>
          
          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

          <button type="submit" class="auth-btn">
            Đăng nhập
          </button>
        </form>

        <p class="auth-switch">
          Chưa có tài khoản?
          <router-link to="/register">Đăng ký</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''

  if (!email.value.trim()) {
    errorMessage.value = 'Vui lòng nhập email'
    return
  }

  if (!password.value.trim()) {
    errorMessage.value = 'Vui lòng nhập mật khẩu'
    return
  }

  try {
    const res = await axios.get('http://localhost:3000/users')
    const users = res.data || []

    const foundUser = users.find(
      (user) =>
        user.email === email.value.trim() &&
        user.password === password.value
    )

    if (!foundUser) {
      errorMessage.value = 'Email hoặc mật khẩu không đúng'
      return
    }

    const currentUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role
    }

    localStorage.setItem('currentUser', JSON.stringify(currentUser))
    router.push('/')
  } catch (error) {
    errorMessage.value = 'Có lỗi xảy ra, thử lại sau'
    console.error(error)
  }
}
</script>

<style scoped>
.auth-page {
  padding: 120px 0 60px;
}

.auth-box {
  max-width: 460px;
  margin: 0 auto;
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.auth-title {
  font-size: 32px;
  font-weight: 700;
  color: #111;
  margin-bottom: 24px;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 15px;
  font-weight: 600;
  color: #111;
}

.form-input {
  width: 100%;
  height: 48px;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 0 14px;
  font-size: 15px;
  outline: none;
}

.form-input:focus {
  border-color: #111;
}

.auth-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: #facc15;
  color: #111;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.auth-btn:hover {
  opacity: 0.92;
}

.auth-switch {
  margin-top: 18px;
  text-align: center;
  font-size: 15px;
  color: #666;
}

.auth-switch a {
  color: #111;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 480px) {
  .auth-page {
    padding: 100px 0 40px;
  }

  .auth-box {
    padding: 22px 16px;
    border-radius: 16px;
  }

  .auth-title {
    font-size: 26px;
  }
}
.error-text {
  font-size: 14px;
  font-weight: 600;
  color: #dc2626;
  margin-top: -4px;
}
</style>