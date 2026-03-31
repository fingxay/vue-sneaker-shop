<template>
  <div class="admin-dashboard">
    <div class="dashboard-topbar">
      <div>
        <p class="dashboard-eyebrow">Admin Dashboard</p>
        <h2 class="admin-page-title">Tổng quan cửa hàng</h2>
        <p class="admin-page-desc">
          Theo dõi nhanh sản phẩm, đơn hàng và trạng thái hệ thống.
        </p>
      </div>

      <div class="dashboard-badge">
        <span class="badge-dot"></span>
        Dữ liệu đang hoạt động
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card primary-card">
        <div class="stat-card-top">
          <p class="stat-label">Tổng sản phẩm</p>
          <span class="stat-icon">📦</span>
        </div>
        <h3 class="stat-value">{{ totalProducts }}</h3>
        <p class="stat-note">Tất cả sản phẩm trong hệ thống</p>
      </div>

      <div class="stat-card">
        <div class="stat-card-top">
          <p class="stat-label">Đang hiển thị</p>
          <span class="stat-icon">👟</span>
        </div>
        <h3 class="stat-value">{{ activeProducts }}</h3>
        <p class="stat-note">Sản phẩm đang được mở bán</p>
      </div>

      <div class="stat-card">
        <div class="stat-card-top">
          <p class="stat-label">Tổng đơn hàng</p>
          <span class="stat-icon">🧾</span>
        </div>
        <h3 class="stat-value">{{ totalOrders }}</h3>
        <p class="stat-note">Số đơn đã được tạo</p>
      </div>

      <div class="stat-card">
        <div class="stat-card-top">
          <p class="stat-label">Người dùng</p>
          <span class="stat-icon">👤</span>
        </div>
        <h3 class="stat-value">{{ totalUsers }}</h3>
        <p class="stat-note">Không tính tài khoản admin</p>
      </div>

      <div class="stat-card">
        <div class="stat-card-top">
          <p class="stat-label">Doanh thu</p>
          <span class="stat-icon">💰</span>
        </div>
        <h3 class="stat-value revenue-value">{{ formatPrice(totalRevenue) }}</h3>
        <p class="stat-note">Tổng tiền từ các đơn đã hoàn thành</p>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="dashboard-panel">
        <div class="panel-header">
          <div>
            <p class="panel-kicker">Order Analytics</p>
            <h3 class="panel-title">Biểu đồ trạng thái đơn hàng</h3>
          </div>
        </div>

        <div class="chart-box doughnut-box">
          <Doughnut :data="orderStatusChartData" :options="doughnutChartOptions" />
        </div>
      </div>

      <div class="dashboard-panel">
        <div class="panel-header">
          <div>
            <p class="panel-kicker">Revenue Analytics</p>
            <h3 class="panel-title">Doanh thu 7 ngày gần nhất</h3>
          </div>
        </div>

        <div class="chart-box bar-box">
          <Bar :data="overviewChartData" :options="barChartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js'
import { Doughnut, Bar } from 'vue-chartjs'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement
)

const products = ref([])
const orders = ref([])
const users = ref([])

const totalProducts = computed(() => products.value.length)

const activeProducts = computed(() =>
  products.value.filter((product) => product.isActive !== false).length
)

const totalOrders = computed(() => orders.value.length)

const totalUsers = computed(() =>
  users.value.filter((user) => user.role !== 'admin').length
)

const totalRevenue = computed(() => {
  const completedRevenueOrders = orders.value.filter(
    (order) => order.status === 'completed'
  )
  return completedRevenueOrders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  )
})

const formatPrice = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value || 0) + 'đ'
}

const formatDateKey = (dateString) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDayLabel = (date) => {
  return `${String(date.getDate()).padStart(2, '0')}/${String(
    date.getMonth() + 1
  ).padStart(2, '0')}`
}

const pendingOrders = computed(() =>
  orders.value.filter((order) => order.status === 'pending').length
)

const confirmedOrders = computed(() =>
  orders.value.filter((order) => order.status === 'confirmed').length
)

const shippingOrders = computed(() =>
  orders.value.filter((order) => order.status === 'shipping').length
)

const completedOrders = computed(() =>
  orders.value.filter((order) => order.status === 'completed').length
)

const cancelledOrders = computed(() =>
  orders.value.filter((order) => order.status === 'cancelled').length
)

const dailyRevenue7Days = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    return date
  })

  const revenueMap = {}

  last7Days.forEach((date) => {
    revenueMap[formatDateKey(date)] = 0
  })

  orders.value.forEach((order) => {
    if (order.status !== 'completed' || !order.completedAt) return

  const dateKey = formatDateKey(order.completedAt)

    if (dateKey in revenueMap) {
      revenueMap[dateKey] += order.totalAmount || 0
    }
  })

  return {
    labels: last7Days.map((date) => formatDayLabel(date)),
    values: last7Days.map((date) => revenueMap[formatDateKey(date)])
  }
})

const orderStatusChartData = computed(() => ({
  labels: [
    'Chờ xác nhận',
    'Đã xác nhận',
    'Đang giao',
    'Hoàn thành',
    'Đã hủy'
  ],
  datasets: [
    {
      data: [
        pendingOrders.value,
        confirmedOrders.value,
        shippingOrders.value,
        completedOrders.value,
        cancelledOrders.value
      ],
      backgroundColor: [
        '#facc15',
        '#60a5fa',
        '#818cf8',
        '#4ade80',
        '#f87171'
      ],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 10
    }
  ]
}))

const doughnutChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 18,
        font: {
          size: 12,
          weight: '600'
        }
      }
    },
    tooltip: {
      callbacks: {
        label(context) {
          return `${context.label}: ${context.raw}`
        }
      }
    }
  },
  cutout: '68%'
}))

const overviewChartData = computed(() => ({
  labels: dailyRevenue7Days.value.labels,
  datasets: [
    {
      label: 'Doanh thu',
      data: dailyRevenue7Days.value.values,
      backgroundColor: '#22c55e',
      borderRadius: 10,
      maxBarThickness: 46
    }
  ]
}))

const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label(context) {
          return `Doanh thu: ${formatPrice(context.raw)}`
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#475569',
        font: {
          size: 12,
          weight: '600'
        }
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: '#64748b',
        callback(value) {
          return formatPrice(value)
        }
      },
      grid: {
        color: '#e2e8f0'
      }
    }
  }
}))

const loadDashboardData = async () => {
  try {
    const [productsRes, ordersRes, usersRes] = await Promise.all([
      axios.get('http://localhost:3000/products'),
      axios.get('http://localhost:3000/orders'),
      axios.get('http://localhost:3000/users')
    ])

    products.value = productsRes.data || []
    orders.value = ordersRes.data || []
    users.value = usersRes.data || []
  } catch (error) {
    console.error('Lỗi load dashboard:', error)
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.dashboard-eyebrow {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #2563eb;
  margin: 0 0 8px;
}

.admin-page-title {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px;
}

.admin-page-desc {
  font-size: 15px;
  color: #64748b;
  margin: 0;
}

.dashboard-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.badge-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #22c55e;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.primary-card {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border: none;
}

.primary-card .stat-label,
.primary-card .stat-note,
.primary-card .stat-value,
.primary-card .stat-icon {
  color: #ffffff;
}

.stat-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.stat-icon {
  font-size: 22px;
}

.stat-value {
  font-size: 34px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px;
}

.revenue-value {
  font-size: 28px;
  line-height: 1.3;
  word-break: break-word;
}

.stat-note {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.dashboard-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  padding: 22px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.panel-kicker {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  margin: 0 0 6px;
}

.panel-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.chart-box {
  position: relative;
  width: 100%;
}

.doughnut-box {
  height: 360px;
}

.bar-box {
  height: 360px;
}

.order-status-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}

.status-card {
  border-radius: 18px;
  padding: 18px;
}

.status-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.status-label {
  font-size: 14px;
  color: #0f172a;
  margin: 0;
}

.status-icon {
  font-size: 16px;
}

.status-value {
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.pending-card {
  background: #fef3c7;
}

.confirmed-card {
  background: #dbeafe;
}

.shipping-card {
  background: #e0e7ff;
}

.completed-card {
  background: #dcfce7;
}

.cancelled-card {
  background: #fee2e2;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.summary-name {
  font-size: 14px;
  color: #475569;
}

.summary-value {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

@media (max-width: 1280px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-content {
    grid-template-columns: 1fr;
  }

  .order-status-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-grid,
  .order-status-grid {
    grid-template-columns: 1fr;
  }

  .doughnut-box,
  .bar-box {
    height: 300px;
  }
}
</style>