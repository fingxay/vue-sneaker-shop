<template>
  <div class="admin-products">
    <div class="admin-page-header">
      <h2 class="admin-page-title">Quản lý sản phẩm</h2>
      <button type="button" class="add-product-btn">Thêm sản phẩm</button>
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

          <tr v-for="product in products" :key="product.id">
            <td>{{ product.id }}</td>
            <td>{{ product.image }}</td>
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
    <div v-if="selectedProduct" class="edit-modal-overlay" @click.self="selectedProduct = null">
      <div class="edit-modal">
        <div class="edit-modal-header">
          <h3 class="edit-box-title">Sửa sản phẩm</h3>
          <button type="button" class="close-btn" @click="selectedProduct = null">×</button>
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
                v-model="selectedSizeItem.size"
                class="form-input"
                :disabled="!selectedSizeItem"
              />
            </div>

            <div class="form-group">
              <label>Số lượng</label>
              <input
                v-model.number="selectedSizeItem.quantity"
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
            type="button"
            class="save-btn"
            @click="handleSaveProduct"
          >
            Lưu thay đổi
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import BaseConfirmModal from '@/components/common/BaseConfirmModal.vue'

const products = ref([])

const selectedProduct = ref(null)

const selectedSizeId = ref('')

const isDeleteSizeModalOpen = ref(false)

const openDeleteSizeModal = () => {
  if (!selectedSizeItem.value) return
  isDeleteSizeModalOpen.value = true
}

const closeDeleteSizeModal = () => {
  isDeleteSizeModalOpen.value = false
}

const handleSaveProduct = async () => {
  if (!selectedProduct.value) return

  try {
    await axios.put(
      `http://localhost:3000/products/${selectedProduct.value.id}`,
      selectedProduct.value
    )

    await fetchProducts()
    selectedProduct.value = null
    selectedSizeId.value = ''
  } catch (error) {
    console.error('Lỗi khi lưu sản phẩm:', error)
  }
}

const selectedSizeItem = computed(() => {
  if (!selectedProduct.value || !selectedSizeId.value) return null

  return selectedProduct.value.sizes.find(
    (sizeItem) => String(sizeItem.id) === String(selectedSizeId.value)
  )
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.admin-page-title {
  font-size: 28px;
  font-weight: 700;
  color: #111;
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
  display: flex;
  align-items: center;
  gap: 8px;
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
  justify-content: flex-end;
  margin-top: 20px;
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
</style>