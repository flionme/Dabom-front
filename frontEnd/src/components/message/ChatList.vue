<script setup>

import { ref, computed } from 'vue'
import ChatListHeader from './ChatListHeader.vue'
import ChatListSearch from './ChatListSearch.vue'
import ChatItem from './ChatItem.vue'

const props = defineProps({
  chatData: {
    type: Object,
    required: true
  },
  currentChatId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['chat-selected'])

const searchQuery = ref('')

const filteredChatData = computed(() => {
  if (!searchQuery.value) return props.chatData

  const filtered = {}
  Object.entries(props.chatData).forEach(([id, chat]) => {
    if (
      chat.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.value.toLowerCase())
    ) {
      filtered[id] = chat
    }
  })
  return filtered
})

function handleSearch(query) {
  searchQuery.value = query
}

function handleChatClick(chatId) {
  emit('chat-selected', chatId)
}
</script>

<template>
      <div class="chat-list">
    <ChatListHeader />
    <ChatListSearch @search="handleSearch" />
    <div class="chat-list-content">
      <ChatItem
        v-for="(chat, id) in filteredChatData"
        :key="id"
        :chat-id="id"
        :chat="chat"
        :is-active="id === currentChatId"
        @click="handleChatClick"
      />
    </div>
  </div>

</template>

<style scoped>
@import url(../../assets/message/ChatList.css);

</style>