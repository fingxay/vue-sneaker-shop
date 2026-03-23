<template>
  <div class="auth-page">
    <div class="container">
      <div class="auth-box">
        <h1 class="auth-title">Đăng ký</h1>

        <form class="auth-form" @submit.prevent="handleRegister">
          <div class="form-group">
            <label class="form-label">Họ và tên</label>
            <input
              v-model="name"
              type="text"
              class="form-input"
              placeholder="Nhập họ và tên"
            />
          </div>

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

          <div class="form-group">
            <label class="form-label">Nhập lại mật khẩu</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="form-input"
              placeholder="Nhập lại mật khẩu"
            />
          </div>

          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

          <button type="submit" class="auth-btn">
            Đăng ký
          </button>
        </form>

        <p class="auth-switch">
          Đã có tài khoản?
          <router-link to="/login">Đăng nhập</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const handleRegister = () => {
  errorMessage.value = ''

  if (!name.value.trim()) {
    errorMessage.value = 'Vui lòng nhập họ và tên'
    return
  }

  if (!email.value.trim()) {
    errorMessage.value = 'Vui lòng nhập email'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMessage.value = 'Email không đúng định dạng'
    return
  }

  if (!password.value) {
    errorMessage.value = 'Vui lòng nhập mật khẩu'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự'
    return
  }

  if (!confirmPassword.value) {
    errorMessage.value = 'Vui lòng nhập lại mật khẩu'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Mật khẩu nhập lại không khớp'
    return
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