<template>
  <div
    class="brand-filter"
    :class="`variant-${variant}`"
    @mouseenter="isOpen = true"
    @mouseleave="isOpen = false"
  >
    <button type="button" class="brand-filter-trigger">
      {{ label }}
    </button>

    <div v-if="isOpen" class="dropdown-menu">
      <button
        v-for="brand in brands"
        :key="brand"
        type="button"
        class="dropdown-item"
        @click="handleSelectBrand(brand)"
      >
        {{ brand }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  brands: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: 'Sản phẩm'
  },
  variant: {
    type: String,
    default: 'dark'
  }
})

const emit = defineEmits(['select'])

const isOpen = ref(false)

const handleSelectBrand = (brand) => {
  isOpen.value = false
  emit('select', brand)
}
</script>

<style scoped>
.brand-filter {
  position: relative;
  display: flex;
  align-items: center;
  height: 52px;
}

.brand-filter-trigger {
  border: none;
  background: transparent;
  color: white;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.2s ease;
  padding: 0;
}

.brand-filter-trigger:hover {
  color: #facc15;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  overflow: hidden;
  z-index: 20;
}

.dropdown-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: white;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #111;
  transition: 0.2s ease;
}

.dropdown-item:hover {
  background: #f5f5f5;
  color: #facc15;
}

.brand-filter.variant-light .brand-filter-trigger {
  height: 42px;
  padding: 0 16px;
  border: 1px solid #ddd;
  border-radius: 999px;
  background: white;
  color: #111;
}

.brand-filter.variant-light .brand-filter-trigger:hover {
  color: #111;
  border-color: #facc15;
}
</style>