<template>
  <div class="admin-products">
    <div class="admin-page-header">
      <div class="admin-page-left">
        <h2 class="admin-page-title">Quản lý sản phẩm</h2>

        <BaseBrandFilter
          :brands="brands"
          label="Lọc theo brand"
          variant="light"
          @select="handleSelectBrand"
        />
      </div>

      <div class="admin-page-search">
        <BaseSearchBox
          v-model="searchInput"
          placeholder="Tìm sản phẩm..."
          button-text="Tìm"
          @search="handleSearchProduct"
        />
      </div>

      <button type="button" class="add-product-btn" @click="handleOpenAddProduct">
        Thêm sản phẩm
      </button>
    </div>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Brand</th>
            <th>Giá</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="!products.length">
            <td colspan="6">Chưa có sản phẩm nào</td>
          </tr>

          <tr v-for="product in paginatedProducts" :key="product.id">
            <td>{{ product.id }}</td>
            <td>
              <img :src="getProductImage(product.image)" :alt="product.name" class="product-thumb" />
            </td>
            <td>{{ product.name }}</td>
            <td>{{ product.brand }}</td>
            <td>{{ product.price }}</td>
            <td class="action-cell">
              <button
                type="button"
                class="action-btn edit-btn"
                @click="handleEditProduct(product)"
              >
                Sửa
              </button>

              <button
                type="button"
                class="action-btn"
                @click="toggleProductStatus(product)"
              >
                {{ product.isActive === false ? 'Hiện' : 'Ẩn' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

      <div class="admin-pagination-wrap">
        <BasePagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @change-page="currentPage = $event"
        />
      </div>

      <div v-if="selectedProduct" class="edit-modal-overlay" @click.self="handleCloseModal">
      <div class="edit-modal">
        <div class="edit-modal-header">
          <h3 class="edit-box-title">
            {{ isAddMode ? 'Thêm sản phẩm' : 'Sửa sản phẩm' }}
          </h3>
          <button type="button" class="close-btn" @click="handleCloseModal">×</button>
        </div>

        <div class="edit-form-grid">
          <div class="form-group">
            <label>Tên sản phẩm</label>
            <input v-model="selectedProduct.name" type="text" class="form-input" />
          </div>

          <div class="form-group">
            <label>Brand</label>
            <input v-model="selectedProduct.brand" type="text" class="form-input" />
          </div>

          <div class="form-group">
            <label>Giá</label>
            <input v-model="selectedProduct.price" type="number" class="form-input" />
          </div>

          <div class="form-group">
            <label>Ảnh</label>
            <input v-model="selectedProduct.image" type="text" class="form-input" />
          </div>
        </div>

        <div class="sizes-box">
          <div class="sizes-header">
            <h4 class="sizes-title">Size và số lượng</h4>

            <div class="sizes-actions">
              <button
                type="button"
                class="add-size-btn"
                @click="handleAddSize"
              >
                + Thêm size
              </button>

              <button
                type="button"
                class="remove-size-btn"
                @click="openDeleteSizeModal"
                :disabled="!selectedSizeItem"
              >
                Xóa size đang chọn
              </button>
            </div>
          </div>

          <div class="form-group size-select-group">
            <label>Chọn size</label>
            <select v-model="selectedSizeId" class="form-input">
              <option value="">-- Chọn size --</option>
              <option
                v-for="sizeItem in selectedProduct.sizes"
                :key="sizeItem.id"
                :value="sizeItem.id"
              >
                {{ sizeItem.size }}
              </option>
            </select>
          </div>

          <div class="size-row">
            <div class="form-group">
              <label>Size đang chọn</label>
              <input
                :value="selectedSizeItem?.size || ''"
                @input="selectedSizeItem && (selectedSizeItem.size = $event.target.value)"
                class="form-input"
                :disabled="!selectedSizeItem"
              />
            </div>

            <div class="form-group">
              <label>Số lượng</label>
              <input
                :value="selectedSizeItem?.quantity ?? ''"
                @input="selectedSizeItem && (selectedSizeItem.quantity = Number($event.target.value))"
                type="number"
                class="form-input"
                :disabled="!selectedSizeItem"
              />
            </div>
          </div>
        </div>

        <div class="form-group full-width">
          <label>Mô tả</label>
          <textarea
            v-model="selectedProduct.description"
            class="form-textarea"
          ></textarea>
        </div>

        <div class="edit-modal-actions">
          <button
            v-if="!isAddMode"
            type="button"
            class="delete-product-btn"
            @click="openDeleteProductModal"
          >
            Xóa sản phẩm
          </button>

          <button
            type="button"
            class="save-btn"
            @click="handleSaveProduct"
          >
            {{ isAddMode ? 'Thêm sản phẩm' : 'Lưu thay đổi' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <BaseConfirmModal
    :isOpen="isDeleteSizeModalOpen"
    title="Xóa size"
    message="Bạn có chắc muốn xóa size đang chọn không? Hành động này sẽ xóa size khỏi sản phẩm."
    confirmText="Xóa"
    cancelText="Hủy"
    variant="danger"
    @confirm="handleRemoveSelectedSize"
    @cancel="closeDeleteSizeModal"
  />

  <BaseConfirmModal
    :isOpen="isDeleteProductModalOpen"
    title="Xóa sản phẩm"
    message="Bạn có chắc muốn xóa sản phẩm này không? Hành động này không thể hoàn tác."
    confirmText="Xóa"
    cancelText="Hủy"
    variant="danger"
    @confirm="handleDeleteProduct"
    @cancel="closeDeleteProductModal"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import BaseSearchBox from '@/components/common/BaseSearchBox.vue'
import BaseBrandFilter from '@/components/common/BaseBrandFilter.vue'

const sneakerImages = require.context('@/assets/sneakers', false, /\.(png|jpe?g|webp)$/)

const getProductImage = (imageName) => {
  try {
    return sneakerImages(`./${imageName}`)
  } catch (error) {
    return sneakerImages('./sneaker1.jpg')
  }
}

const handleSearchProduct = () => {
  searchKeyword.value = searchInput.value.trim()
  currentPage.value = 1
}

const handleSelectBrand = (brand) => {
  selectedBrand.value = brand
  currentPage.value = 1
}

const isAddMode = ref(false)

const products = ref([])
const currentPage = ref(1)
const itemsPerPage = 8
const searchInput = ref('')
const searchKeyword = ref('')
const selectedBrand = ref('Tất cả')

const brands = computed(() => {
  const uniqueBrands = [...new Set(products.value.map((product) => product.brand))]
  return ['Tất cả', ...uniqueBrands]
})

const selectedProduct = ref(null)

const selectedSizeId = ref('')

const isDeleteSizeModalOpen = ref(false)

const isDeleteProductModalOpen = ref(false)

const openDeleteProductModal = () => {
  if (!selectedProduct.value || isAddMode.value) return
  isDeleteProductModalOpen.value = true
}

const closeDeleteProductModal = () => {
  isDeleteProductModalOpen.value = false
}

const handleOpenAddProduct = () => {
  isAddMode.value = true

  selectedProduct.value = {
    id: String(Date.now()),
    name: '',
    brand: '',
    price: 0,
    image: '',
    description: '',
    isActive: true,
    sizes: []
  }

  selectedSizeId.value = ''
}

const openDeleteSizeModal = () => {
  if (!selectedSizeItem.value) return
  isDeleteSizeModalOpen.value = true
}

const closeDeleteSizeModal = () => {
  isDeleteSizeModalOpen.value = false
}

const handleCloseModal = () => {
  selectedProduct.value = null
  selectedSizeId.value = ''
  isAddMode.value = false
}

const handleSaveProduct = async () => {
  if (!selectedProduct.value) return

  try {
    if (isAddMode.value) {
      await axios.post('http://localhost:3000/products', selectedProduct.value)
    } else {
      await axios.put(
        `http://localhost:3000/products/${selectedProduct.value.id}`,
        selectedProduct.value
      )
    }

    await fetchProducts()
    selectedProduct.value = null
    selectedSizeId.value = ''
    isAddMode.value = false
  } catch (error) {
    console.error('Lỗi khi lưu sản phẩm:', error)
  }
}

const handleDeleteProduct = async () => {
  if (!selectedProduct.value || isAddMode.value) return

  try {
    await axios.delete(
      `http://localhost:3000/products/${selectedProduct.value.id}`
    )

    await fetchProducts()
    closeDeleteProductModal()
    handleCloseModal()
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error)
  }
}

const selectedSizeItem = computed(() => {
  if (!selectedProduct.value || !selectedSizeId.value) return null

  return selectedProduct.value.sizes.find(
    (sizeItem) => String(sizeItem.id) === String(selectedSizeId.value)
  )
})

const filteredProducts = computed(() => {
  let result = [...products.value]

  if (selectedBrand.value !== 'Tất cả') {
    result = result.filter((product) => product.brand === selectedBrand.value)
  }

  const keyword = searchKeyword.value.trim().toLowerCase()

  if (keyword) {
    result = result.filter((product) => {
      return (
        product.name.toLowerCase().includes(keyword) ||
        product.brand.toLowerCase().includes(keyword)
      )
    })
  }

  return result
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProducts.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage)
})

const handleRemoveSelectedSize = () => {
  if (!selectedProduct.value || !selectedSizeItem.value) return

  const currentIndex = selectedProduct.value.sizes.findIndex(
    (sizeItem) => String(sizeItem.id) === String(selectedSizeId.value)
  )

  if (currentIndex === -1) return

  selectedProduct.value.sizes.splice(currentIndex, 1)

  selectedSizeId.value = selectedProduct.value.sizes?.[0]?.id || ''
  isDeleteSizeModalOpen.value = false
}

const handleAddSize = () => {
  if (!selectedProduct.value) return

  const newSizeItem = {
    id: Date.now(),
    size: '',
    quantity: 0
  }

  selectedProduct.value.sizes.push(newSizeItem)
  selectedSizeId.value = newSizeItem.id
}

const handleEditProduct = (product) => {
  isAddMode.value = false

  selectedProduct.value = {
    ...product,
    sizes: product.sizes ? [...product.sizes] : []
  }

  selectedSizeId.value = selectedProduct.value.sizes?.[0]?.id || ''

  console.log(selectedProduct.value)
}

const fetchProducts = async () => {
  try {
    const res = await axios.get('http://localhost:3000/products')
    products.value = res.data || []
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm:', error)
  }
}

const toggleProductStatus = async (product) => {
  try {
    await axios.patch(`http://localhost:3000/products/${product.id}`, {
      isActive: product.isActive === false
    })

    fetchProducts()
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái sản phẩm:', error)
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.admin-page-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.admin-page-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.admin-page-title {
  font-size: 28px;
  font-weight: 700;
  color: #111;
  margin: 0;
}

.admin-page-search {
  width: 100%;
  max-width: 560px;
  justify-self: center;
}

.add-product-btn {
  height: 42px;
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  background: #facc15;
  color: #111;
  font-weight: 700;
  cursor: pointer;
}

.admin-table-wrap {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.admin-table th {
  font-size: 14px;
  font-weight: 700;
  color: #111;
}

.admin-table td {
  font-size: 14px;
  color: #444;
}

.product-thumb {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #eee;
  display: block;
}

.action-btn {
  height: 34px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  background: #111827;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.action-cell {
  white-space: nowrap;
}

.action-cell .action-btn {
  margin-right: 8px;
}

.action-cell .action-btn:last-child {
  margin-right: 0;
}

.edit-btn {
  background: #facc15;
  color: #111;
}

.edit-box-title {
  font-size: 22px;
  font-weight: 700;
  color: #111;
  margin-bottom: 16px;
}

.edit-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #111;
}

.form-input {
  height: 42px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
}

.edit-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 2000;
}

.edit-modal {
  width: 100%;
  max-width: 760px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.edit-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #f3f4f6;
  color: #111;
  font-size: 22px;
  cursor: pointer;
}

.edit-modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}

.delete-product-btn {
  height: 42px;
  padding: 0 18px;
  border: none;
  border-radius: 10px;
  background: #dc2626;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.save-btn {
  height: 42px;
  padding: 0 18px;
  border: none;
  border-radius: 10px;
  background: #facc15;
  color: #111;
  font-weight: 700;
  cursor: pointer;
}

.full-width {
  grid-column: 1 / -1;
}

.form-textarea {
  min-height: 140px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 12px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  font-family: inherit;
}

.sizes-box {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.sizes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.sizes-title {
  font-size: 20px;
  font-weight: 700;
  color: #111;
  margin: 0;
}

.sizes-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.size-select-group {
  margin-bottom: 18px;
}

.size-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 22px;
}

.full-width {
  grid-column: 1 / -1;
  margin-top: 4px;
}

.add-size-btn {
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  background: #facc15;
  color: #111;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.remove-size-btn {
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  background: #dc2626;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.admin-pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>