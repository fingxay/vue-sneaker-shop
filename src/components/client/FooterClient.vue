<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <h3 class="footer-logo">Sneaker Shop</h3>
          <p class="footer-desc">
            Chuyên giày sneaker thời trang, dễ phối đồ, phù hợp đi học, đi chơi và dùng hằng ngày.
          </p>
        </div>

        <div class="footer-column">
          <h4 class="footer-title">Danh mục</h4>
          <ul class="footer-list">
            <li><router-link to="/">Sản phẩm</router-link></li>
            <li><router-link to="/cart">Giỏ hàng</router-link></li>
            <li><router-link to="/profile">Tài khoản</router-link></li>
          </ul>
        </div>

        <div class="footer-column">
          <h4 class="footer-title">Liên hệ</h4>
          <ul class="footer-list footer-contact">
            <li>Email: support@sneakershop.vn</li>
            <li>Hotline: 0123 456 789</li>
            <li>Địa chỉ: Hà Nội, Việt Nam</li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© 2025 Sneaker Shop. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: linear-gradient(180deg, #111 0%, #000 100%);
  color: #fff;
  margin-top: 60px;
  padding-top: 48px;
  border-top: 3px solid #facc15;
}

.footer-top {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 40px;
  padding-bottom: 32px;
}

.footer-logo {
  font-size: 32px;
  font-weight: 800;
  color: #facc15;
  margin-bottom: 14px;
}

.footer-desc {
  max-width: 420px;
  color: #d1d5db;
  line-height: 1.8;
  font-size: 15px;
}

.footer-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #fff;
}

.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-list li {
  margin-bottom: 12px;
  color: #d1d5db;
  font-size: 15px;
}

.footer-list a {
  color: #d1d5db;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-list a:hover {
  color: #facc15;
}

.footer-contact li {
  line-height: 1.7;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding: 18px 0 22px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

@media (max-width: 900px) {
  .footer-top {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .footer-logo {
    font-size: 28px;
  }
}
</style>