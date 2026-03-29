<template>
  <div class="product-list">
    <h2 class="title">Danh sách sản phẩm</h2>

    <p v-if="route.query.q" class="search-result-text">
      Kết quả tìm kiếm cho: <strong>"{{ route.query.q }}"</strong>
    </p>

    <div v-if="paginatedProducts.length > 0" class="product-grid">
      <ProductCard
        v-for="product in paginatedProducts"
        :key="product.id"
        :product="product"
        @add-to-cart="handleAddToCart"
      />
    </div>

    <div v-else class="empty-state">
      Không tìm thấy sản phẩm
    </div>
  </div>

  <BasePagination
    :current-page="currentPage"
    :total-pages="totalPages"
    @change-page="currentPage = $event"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import ProductCard from './ProductCard.vue'
import BasePagination from '@/components/common/BasePagination.vue'

const route = useRoute()

const products = ref([])
const currentPage = ref(1)
const itemsPerPage = 12

const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim()
}

const isFuzzyMatch = (productName, keyword) => {
  const nameWords = normalizeText(productName).split(/\s+/)
  const keywordWords = normalizeText(keyword).split(/\s+/)

  return keywordWords.every((keywordWord) =>
    nameWords.some((nameWord) => nameWord.includes(keywordWord))
  )
}

const filteredProducts = computed(() => {
  let result = products.value.filter((product) => product.isActive !== false)

  const selectedBrand = route.query.brand
  const searchKeyword = route.query.q

  if (selectedBrand) {
    result = result.filter((product) => product.brand === selectedBrand)
  }

  if (searchKeyword) {
    const normalizedKeyword = normalizeText(searchKeyword)

    result = result.filter((product) => {
      const normalizedName = normalizeText(product.name)
      const normalizedBrand = normalizeText(product.brand)

      const exactMatch =
        normalizedName.includes(normalizedKeyword) ||
        normalizedBrand.includes(normalizedKeyword)

      const fuzzyMatch = isFuzzyMatch(product.name, searchKeyword)

      return exactMatch || fuzzyMatch
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

const fetchProducts = async () => {
  const res = await axios.get('http://localhost:3000/products')
  products.value = res.data
}

watch(
  () => [route.query.brand, route.query.q],
  () => {
    currentPage.value = 1
  }
)

onMounted(() => {
  fetchProducts()
})

const handleAddToCart = (cartItem) => {
  const currentCart = JSON.parse(localStorage.getItem('cart')) || []

  const existingItem = currentCart.find(
    (item) =>
      item.productId === cartItem.productId &&
      item.size === cartItem.size
  )

  if (existingItem) {
    const maxQuantity = cartItem.stock
    existingItem.quantity = Math.min(
      existingItem.quantity + cartItem.quantity,
      maxQuantity
    )
  } else {
    currentCart.push(cartItem)
  }

  localStorage.setItem('cart', JSON.stringify(currentCart))
}
</script>

<style scoped>
.product-list {
  padding: 30px 0;
}

.title {
  font-size: 36px;
  margin-bottom: 20px;
}

.search-result-text {
  margin-bottom: 20px;
  font-size: 16px;
  color: #444;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.empty-state {
  padding: 40px 20px;
  border: 1px dashed #ddd;
  border-radius: 12px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #666;
  background: #fafafa;
}

@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .title {
    font-size: 30px;
  }
}

@media (max-width: 600px) {
  .product-grid {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 26px;
  }
}
</style>