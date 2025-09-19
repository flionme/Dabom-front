<script setup>
import { ref } from 'vue'

const searchQuery = ref('')
const emit = defineEmits(['search'])

function handleSearch() {
  emit('search', searchQuery.value)
}
</script>

<template>
<div class="chat-search">
    <div class="search-wrapper">
      <i class="fas fa-search search-icon"></i>
      <input 
        type="text" 
        class="chat-search-input" 
        placeholder="대화 검색..."
        v-model="searchQuery"
        @input="handleSearch"
      >
    </div>
  </div>
</template>

<style scoped>
@import url(../../assets/message/ChatListSearch.css);

</style>