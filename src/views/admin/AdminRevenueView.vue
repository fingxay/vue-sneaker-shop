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

        <div class="revenue-summary-card">
          <p class="revenue-card-label">Đơn cao nhất</p>
          <h3 class="revenue-card-value">{{ formatPrice(highestOrderValue) }}</h3>
        </div>

        <div class="revenue-summary-card">
          <p class="revenue-card-label">Đơn thấp nhất</p>
          <h3 class="revenue-card-value">{{ formatPrice(lowestOrderValue) }}</h3>
        </div>

        <div class="revenue-summary-card">
          <p class="revenue-card-label">Tổng sản phẩm đã bán</p>
          <h3 class="revenue-card-value">{{ totalSoldProducts }}</h3>
        </div>

        <div class="revenue-summary-card">
          <p class="revenue-card-label">Số đơn COD</p>
          <h3 class="revenue-card-value">{{ codOrderCount }}</h3>
        </div>

        <div class="revenue-summary-card">
          <p class="revenue-card-label">Số đơn chuyển khoản</p>
          <h3 class="revenue-card-value">{{ bankingOrderCount }}</h3>
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

          <button type="button" class="export-pdf-btn" @click="isExportPdfModalOpen = true">
            Xuất PDF
          </button>
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
                <th>Số sản phẩm</th>
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
                <td>
                  {{
                    (order.items || []).reduce((total, item) => {
                      return total + (Number(item.quantity) || 0)
                    }, 0)
                  }}
                </td>
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

  <BaseConfirmModal
    :isOpen="isExportPdfModalOpen"
    title="Xuất báo cáo PDF"
    message="Bạn có chắc muốn xuất báo cáo doanh thu ra file PDF không?"
    confirmText="Xuất PDF"
    cancelText="Hủy"
    variant="warning"
    @confirm="handleConfirmExportPdf"
    @cancel="isExportPdfModalOpen = false"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import BasePagination from '@/components/common/BasePagination.vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import robotoNormal from '@/assets/fonts/roboto-normal.js'
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue'

const isExportPdfModalOpen = ref(false)

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

const highestOrderValue = computed(() => {
  if (!filteredCompletedOrders.value.length) return 0

  return Math.max(
    ...filteredCompletedOrders.value.map((order) => Number(order.totalAmount) || 0)
  )
})

const lowestOrderValue = computed(() => {
  if (!filteredCompletedOrders.value.length) return 0

  return Math.min(
    ...filteredCompletedOrders.value.map((order) => Number(order.totalAmount) || 0)
  )
})

const totalSoldProducts = computed(() => {
  return filteredCompletedOrders.value.reduce((total, order) => {
    const orderItemCount = (order.items || []).reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0)
    }, 0)

    return total + orderItemCount
  }, 0)
})

const codOrderCount = computed(() => {
  return filteredCompletedOrders.value.filter(
    (order) => order.paymentMethod === 'cod'
  ).length
})

const bankingOrderCount = computed(() => {
  return filteredCompletedOrders.value.filter(
    (order) => order.paymentMethod === 'banking'
  ).length
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

const handleExportPdf = () => {
  const doc = new jsPDF()
  doc.addFileToVFS('Roboto-Regular.ttf', robotoNormal)
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')
  doc.setFont('Roboto', 'normal')

  const reportDate = new Date().toLocaleString('vi-VN')

  let filterValue = 'Tất cả'
  if (filterType.value === 'day') filterValue = selectedDay.value || '---'
  if (filterType.value === 'month') filterValue = selectedMonth.value || '---'
  if (filterType.value === 'year') filterValue = selectedYear.value || '---'
  if (filterType.value === 'range') {
    filterValue = `${startDate.value || '---'} đến ${endDate.value || '---'}`
  }

  doc.setFontSize(18)
  doc.text('Báo cáo doanh thu', 14, 18)

  doc.setFontSize(11)
  doc.text(`Kiểu lọc: ${filterTypeLabel.value}`, 14, 28)
  doc.text(`Thời gian báo cáo: ${filterValue}`, 14, 35)
  doc.text(`Ngày xuất báo cáo: ${reportDate}`, 14, 42)

  doc.setFontSize(13)
  doc.text('Tổng quan', 14, 54)

  const summaryRows = [
    ['Tổng doanh thu', formatPrice(totalRevenue.value)],
    ['Số đơn hoàn thành', String(filteredCompletedOrders.value.length)],
    ['Giá trị trung bình / đơn', formatPrice(averageRevenue.value)],
    ['Đơn cao nhất', formatPrice(highestOrderValue.value)],
    ['Đơn thấp nhất', formatPrice(lowestOrderValue.value)],
    ['ổng sản phẩm đã bán', String(totalSoldProducts.value)],
    ['Số đơn COD', String(codOrderCount.value)],
    ['Số đơn chuyển khoản', String(bankingOrderCount.value)]
  ]

  autoTable(doc, {
    startY: 58,
    head: [['Chỉ số', 'Giá trị']],
    body: summaryRows,
    theme: 'grid',
    styles: {
      font: 'Roboto',
      fontStyle: 'normal'
    },
    headStyles: {
      font: 'Roboto',
      fontStyle: 'normal'
    },
    bodyStyles: {
      font: 'Roboto',
      fontStyle: 'normal'
    }
  })

  const detailRows = filteredCompletedOrders.value.map((order) => [
    `#${order.id}`,
    order.customerInfo?.fullName || '---',
    formatDate(order.completedAt),
    order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản',
    String(
      (order.items || []).reduce((total, item) => {
        return total + (Number(item.quantity) || 0)
      }, 0)
    ),
    formatPrice(order.totalAmount)
  ])

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [['Mã đơn', 'Người nhận', 'Hoàn thành lúc', 'Thanh toán', 'Số SP', 'Tổng tiền']],
    body: detailRows,
    theme: 'grid',
    styles: {
      font: 'Roboto',
      fontStyle: 'normal'
    },
    headStyles: {
      font: 'Roboto',
      fontStyle: 'normal'
    },
    bodyStyles: {
      font: 'Roboto',
      fontStyle: 'normal'
    }
  })

  doc.save('bao-cao-doanh-thu.pdf')
}

const handleConfirmExportPdf = () => {
  isExportPdfModalOpen.value = false
  handleExportPdf()
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

.export-pdf-btn {
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  background: #facc15;
  color: #111827;
  font-size: 14px;
  font-weight: 780;
  cursor: pointer;
  transition: 0.2s ease;
}

.export-pdf-btn:hover {
  opacity: 0.92;
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

@media (max-width: 1200px) {
  .revenue-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .revenue-summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>