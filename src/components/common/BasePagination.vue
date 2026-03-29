<template>
  <div class="pagination" v-if="totalPages > 1">
    <button
      type="button"
      class="page-btn"
      :disabled="currentPage === 1"
      @click="$emit('change-page', currentPage - 1)"
    >
      Prev
    </button>

    <button
      v-for="page in totalPages"
      :key="page"
      type="button"
      class="page-btn"
      :class="{ active: currentPage === page }"
      @click="$emit('change-page', page)"
    >
      {{ page }}
    </button>

    <button
      type="button"
      class="page-btn"
      :disabled="currentPage === totalPages"
      @click="$emit('change-page', currentPage + 1)"
    >
      Next
    </button>
  </div>
</template>

<script setup>
defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

defineEmits(['change-page'])
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.page-btn {
  padding: 8px 14px;
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #111;
  color: #fff;
  border-color: #111;
}

.page-btn.active {
  background: #111;
  color: #fff;
  border-color: #111;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>