<template>
  <div class="search-box">
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="search-input"
      @input="$emit('update:modelValue', $event.target.value)"
      @keyup.enter="$emit('search')"
    />
    <button type="button" class="search-btn" @click="$emit('search')">
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Tìm kiếm...'
  },
  buttonText: {
    type: String,
    default: 'Tìm'
  }
})

defineEmits(['update:modelValue', 'search'])
</script>

<style scoped>
.search-box {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid #ddd;
  width: 100%;
  max-width: 420px;
}

.search-input {
  flex: 1;
  height: 42px;
  border: none;
  outline: none;
  padding: 0 14px;
  font-size: 14px;
}

.search-btn {
  height: 42px;
  border: none;
  background: #facc15;
  color: #111;
  font-weight: 600;
  padding: 0 18px;
  cursor: pointer;
}
</style>