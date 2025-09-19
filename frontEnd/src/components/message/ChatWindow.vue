<script setup>
import ChatHeader from './ChatHeader.vue'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'

const props = defineProps({
  currentChat: {
    type: Object,
    default: null
  },
  roomIdx: { // Add roomIdx prop
    type: [String, Number],
    required: true // Make it required as it's crucial
  }
})

const emit = defineEmits(['send-message'])

function handleSendMessage(messageText) {
  emit('send-message', messageText)
}
</script>

<template>
<div class="chat-window" v-if="currentChat">
    <ChatHeader :chat="currentChat" />
    <MessageList
      :room-idx="props.roomIdx"
      :chat-avatar="currentChat.avatar"
    />
    <MessageInput @send-message="handleSendMessage" />
  </div>
</template>

<style scoped>
@import url(../../assets/message/ChatWindow.css);

</style>