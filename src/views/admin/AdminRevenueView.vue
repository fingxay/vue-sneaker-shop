<template>
  <div class="admin-revenue-page">
    <p class="admin-section-label">REVENUE MANAGEMENT</p>
    <h1 class="admin-page-title">Quản lý doanh thu</h1>
    <p class="admin-page-desc">
      Xem doanh thu theo ngày, tháng, năm hoặc khoảng thời gian do admin chọn.
    </p>

    <div class="revenue-filter-card">
      <div class="revenue-filter-grid">
        <div class="revenue-field revenue-filter-type-field">
          <label class="revenue-label">Kiểu lọc</label>

          <div class="custom-select" @click="toggleFilterDropdown">
            <span>{{ filterTypeLabel }}</span>
            <span class="custom-select-arrow" :class="{ open: showFilterDropdown }">⌄</span>
          </div>

          <div v-if="showFilterDropdown" class="custom-select-menu">
            <button type="button" class="custom-select-option" @click.stop="selectFilterType('all')">
              Tất cả
            </button>
            <button type="button" class="custom-select-option" @click.stop="selectFilterType('day')">
              Theo ngày
            </button>
            <button type="button" class="custom-select-option" @click.stop="selectFilterType('month')">
              Theo tháng
            </button>
            <button type="button" class="custom-select-option" @click.stop="selectFilterType('year')">
              Theo năm
            </button>
            <button type="button" class="custom-select-option" @click.stop="selectFilterType('range')">
              Khoảng ngày
            </button>
          </div>
        </div>

        <div v-if="filterType === 'day'" class="revenue-field">
          <label class="revenue-label">Chọn ngày</label>
          <input
            ref="selectedDayInput"
            v-model="selectedDay"
            type="date"
            class="revenue-input revenue-date-input"
            @click="openDatePicker('selectedDayInput')"
          />
        </div>

        <div v-if="filterType === 'month'" class="revenue-field">
          <label class="revenue-label">Chọn tháng</label>
          <input
            ref="selectedMonthInput"
            v-model="selectedMonth"
            type="month"
            class="revenue-input revenue-date-input"
            @click="openDatePicker('selectedMonthInput')"
          />
        </div>

        <div v-if="filterType === 'year'" class="revenue-field">
          <label class="revenue-label">Chọn năm</label>
          <select v-model="selectedYear" class="revenue-select">
            <option value="">Chọn năm</option>
            <option
              v-for="year in availableYears"
              :key="year"
              :value="String(year)"
            >
              {{ year }}
            </option>
          </select>
        </div>

        <template v-if="filterType === 'range'">
          <div class="revenue-field">
            <label class="revenue-label">Từ ngày</label>
            <input
              ref="startDateInput"
              v-model="startDate"
              type="date"
              class="revenue-input revenue-date-input"
              @click="openDatePicker('startDateInput')"
            />
          </div>

          <div class="revenue-field">
            <label class="revenue-label">Đến ngày</label>
            <input
              ref="endDateInput"
              v-model="endDate"
              type="date"
              class="revenue-input revenue-date-input"
              @click="openDatePicker('endDateInput')"
            />
          </div>
        </template>
      </div>
    </div>

    <div v-if="loading" class="admin-empty-state">
      Đang tải dữ liệu doanh thu...
    </div>

    <div v-else>
      <div class="revenue-summary-grid">
        <div class="revenue-summary-card">
          <p class="revenue-card-label">Tổng doanh thu</p>
          <h3 class="revenue-card-value">{{ formatPrice(totalRevenue) }}</h3>
        </div>

        <div class="revenue-summary-card">
          <p class="revenue-card-label">Số đơn hoàn thành</p>
          <h3 class="revenue-card-value">{{ filteredCompletedOrders.length }}</h3>
        </div>

        <div class="revenue-summary-card">
          <p class="revenue-card-label">Giá trị trung bình / đơn</p>
          <h3 class="revenue-card-value">{{ formatPrice(averageRevenue) }}</h3>
        </div>
      </div>

      <div class="revenue-table-card">
        <div class="revenue-table-header">
          <div>
            <h2 class="revenue-table-title">Chi tiết doanh thu</h2>
            <p class="revenue-table-subtitle">
              Chỉ tính các đơn đã hoàn thành
            </p>
          </div>
        </div>

        <div v-if="!filteredCompletedOrders.length" class="admin-empty-state revenue-inner-empty">
          Không có dữ liệu doanh thu phù hợp
        </div>

        <div v-else class="revenue-table-wrap">
          <table class="revenue-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Người nhận</th>
                <th>Ngày đặt</th>
                <th>Hoàn thành lúc</th>
                <th>Thanh toán</th>
                <th>Tổng tiền</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="order in paginatedCompletedOrders"
                :key="order.id"
              >
                <td>#{{ order.id }}</td>
                <td>{{ order.customerInfo?.fullName || '---' }}</td>
                <td>{{ formatDate(order.createdAt) }}</td>
                <td>{{ formatDate(order.completedAt) }}</td>
                <td>{{ order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản' }}</td>
                <td class="revenue-money-cell">{{ formatPrice(order.totalAmount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <BasePagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          @change-page="handleChangePage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import BasePagination from '@/components/common/BasePagination.vue'

const loading = ref(false)
const orders = ref([])

const filterType = ref('all')
const selectedDay = ref('')
const selectedMonth = ref('')
const selectedYear = ref('')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const itemsPerPage = 5
const showFilterDropdown = ref(false)
const selectedDayInput = ref(null)
const selectedMonthInput = ref(null)
const startDateInput = ref(null)
const endDateInput = ref(null)

const completedOrders = computed(() => {
  return orders.value.filter((order) => order.status === 'completed')
})

const filterTypeLabel = computed(() => {
  const labelMap = {
    all: 'Tất cả',
    day: 'Theo ngày',
    month: 'Theo tháng',
    year: 'Theo năm',
    range: 'Khoảng ngày'
  }

  return labelMap[filterType.value] || 'Tất cả'
})

const availableYears = computed(() => {
  const years = completedOrders.value
    .map((order) => {
      const date = order.completedAt || order.createdAt
      return new Date(date).getFullYear()
    })
    .filter(Boolean)

  return [...new Set(years)].sort((a, b) => b - a)
})

const filteredCompletedOrders = computed(() => {
  let result = [...completedOrders.value]

  if (filterType.value === 'day' && selectedDay.value) {
    result = result.filter((order) => {
      const completedDate = formatDateOnly(order.completedAt)
      return completedDate === selectedDay.value
    })
  }

  if (filterType.value === 'month' && selectedMonth.value) {
    result = result.filter((order) => {
      const completedMonth = formatMonthOnly(order.completedAt)
      return completedMonth === selectedMonth.value
    })
  }

  if (filterType.value === 'year' && selectedYear.value) {
    result = result.filter((order) => {
      const completedYear = String(new Date(order.completedAt).getFullYear())
      return completedYear === selectedYear.value
    })
  }

  if (filterType.value === 'range' && startDate.value && endDate.value) {
    result = result.filter((order) => {
      const completedDate = formatDateOnly(order.completedAt)
      return completedDate >= startDate.value && completedDate <= endDate.value
    })
  }

  return result.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
})

const totalPages = computed(() => {
  return Math.ceil(filteredCompletedOrders.value.length / itemsPerPage) || 1
})

const paginatedCompletedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredCompletedOrders.value.slice(start, end)
})

const totalRevenue = computed(() => {
  return filteredCompletedOrders.value.reduce((total, order) => {
    return total + (Number(order.totalAmount) || 0)
  }, 0)
})

const averageRevenue = computed(() => {
  if (!filteredCompletedOrders.value.length) return 0
  return totalRevenue.value / filteredCompletedOrders.value.length
})

const handleChangePage = (page) => {
  currentPage.value = page
}

const toggleFilterDropdown = () => {
  showFilterDropdown.value = !showFilterDropdown.value
}

const selectFilterType = (type) => {
  filterType.value = type
  showFilterDropdown.value = false
}

const openDatePicker = (inputRefName) => {
  const inputMap = {
    selectedDayInput,
    selectedMonthInput,
    startDateInput,
    endDateInput
  }

  const inputRef = inputMap[inputRefName]?.value

  if (!inputRef) return

  inputRef.showPicker?.()
  inputRef.focus()
}

const fetchOrders = async () => {
  try {
    loading.value = true
    const res = await axios.get('http://localhost:3000/orders')
    orders.value = res.data || []
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
  if (!dateString) return '---'
  return new Date(dateString).toLocaleString('vi-VN')
}

const formatDateOnly = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatMonthOnly = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

watch(
  [filterType, selectedDay, selectedMonth, selectedYear, startDate, endDate],
  () => {
    currentPage.value = 1
  }
)

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.admin-section-label {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #2563eb;
  margin-bottom: 12px;
}

.admin-page-title {
  font-size: 40px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 12px;
}

.admin-page-desc {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 24px;
}

.admin-empty-state {
  padding: 24px;
  border-radius: 16px;
  background: #ffffff;
  color: #6b7280;
  font-weight: 600;
}

.revenue-filter-card,
.revenue-table-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.revenue-filter-card {
  margin-bottom: 24px;
}

.revenue-filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.revenue-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.revenue-label {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
}

.revenue-input,
.revenue-select {
  width: 100%;
  height: 52px;
  border: 1px solid #d7deea;
  border-radius: 16px;
  padding: 0 16px;
  font-size: 15px;
  font-weight: 500;
  color: #111827;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  outline: none;
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
}

.revenue-input:hover,
.revenue-select:hover {
  border-color: #b8c4d9;
}

.revenue-input:focus,
.revenue-select:focus {
  border-color: #facc15;
  box-shadow: 0 0 0 4px rgba(250, 204, 21, 0.18);
  background: #ffffff;
}

.revenue-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.revenue-summary-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.revenue-card-label {
  font-size: 14px;
  font-weight: 700;
  color: #6b7280;
  margin-bottom: 10px;
}

.revenue-card-value {
  font-size: 28px;
  font-weight: 800;
  color: #111827;
}

.revenue-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}

.revenue-table-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 6px;
}

.revenue-table-subtitle {
  font-size: 14px;
  color: #6b7280;
}

.revenue-table-wrap {
  overflow-x: auto;
}

.revenue-table {
  width: 100%;
  border-collapse: collapse;
}

.revenue-table thead th {
  text-align: left;
  font-size: 14px;
  font-weight: 800;
  color: #374151;
  background: #f9fafb;
  padding: 14px 16px;
}

.revenue-table tbody td {
  padding: 16px;
  font-size: 14px;
  color: #374151;
  border-top: 1px solid #e5e7eb;
}

.revenue-money-cell {
  font-weight: 800;
  color: #15803d;
}

.revenue-inner-empty {
  box-shadow: none;
  background: #f9fafb;
  padding: 18px;
}

.revenue-filter-type-field {
  position: relative;
}

.custom-select {
  height: 52px;
  border: 1px solid #d7deea;
  border-radius: 16px;
  padding: 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
}

.custom-select:hover {
  border-color: #b8c4d9;
}

.custom-select-arrow {
  font-size: 18px;
  color: #6b7280;
  transition: transform 0.2s ease;
}

.custom-select-arrow.open {
  transform: rotate(180deg);
}

.custom-select-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14);
  padding: 8px;
  z-index: 30;
}

.custom-select-option {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  cursor: pointer;
  transition: all 0.18s ease;
}

.custom-select-option:hover {
  background: #fef3c7;
  color: #111827;
}

@media (max-width: 992px) {
  .revenue-summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>