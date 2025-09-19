<script setup>
import OnlineStatus from './OnlineStatus.vue'

const props = defineProps({
  chatId: {
    type: String,
    required: true
  },
  chat: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

function handleClick() {
  emit('click', props.chatId)
}
</script>

<template>
    <div 
    class="chat-item" 
    :class="{ active: isActive }"
    @click="handleClick"
  >
    <div class="chat-avatar">
      <img :src="chat.avatar" :alt="chat.name">
      <OnlineStatus v-if="chat.isOnline" />
    </div>
    <div class="chat-info">
      <div class="chat-name">{{ chat.name }}</div>
      <div class="chat-last-message">{{ chat.lastMessage }}</div>
    </div>
    <div class="chat-meta">
      <div class="chat-time">{{ chat.time }}</div>
      <div 
        v-if="chat.unreadCount > 0" 
        class="unread-count"
      >
        {{ chat.unreadCount }}
      </div>
    </div>
  </div>

</template>

<style scoped>
@import url(../../assets/message/ChatItem.css);

</style>