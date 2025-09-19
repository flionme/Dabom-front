<script setup>
import { ref, nextTick } from 'vue';
import { useSocketStore } from '@/stores/socket';
import { useChatStore } from '@/stores/useChatStore'; // Import the new store

const messageText = ref('');
const textarea = ref(null);
const emit = defineEmits(['send-message', 'attach', 'image', 'voice']);

const socketStore = useSocketStore(); // 스토어 사용
const chatStore = useChatStore(); // Initialize the new store

function handleInput() {
  if (textarea.value) {
    textarea.value.style.height = 'auto';
    textarea.value.style.height = Math.min(textarea.value.scrollHeight, 120) + 'px';
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey && messageText.value.trim()) {
    e.preventDefault();
    sendMessage();
  }
}

function sendMessage() {
  if (!messageText.value.trim()) return;

  // Get roomIdx and recipientIdx from chatStore
  const roomIdx = chatStore.currentRoomIdx;
  const recipientIdx = chatStore.currentRecipientIdx;
  const senderIdx = chatStore.currentMemberIdx; // Get current user's ID from chatStore
  const senderName = chatStore.currentMemberName; // Get current user's name from chatStore

  // Ensure roomIdx and recipientIdx are available from the store
  if (roomIdx === null || recipientIdx === null || senderIdx === null || senderName === null) {
    console.error('Chat room not selected, recipient, or sender info not found in store.');
    return;
  }

  // senderIdx and senderName will be populated by the backend using @AuthenticationPrincipal
  const messageDto = {
    roomIdx: parseInt(roomIdx),
    recipientIdx: parseInt(recipientIdx),
    message: messageText.value.trim(),
    // isRead and createdAt are likely handled by backend or are optional
  };

  socketStore.sendMessage(messageDto); // 스토어를 통해 메시지 전송

  messageText.value = '';
  nextTick(() => {
    if (textarea.value) {
      textarea.value.style.height = 'auto';
    }
  });
}

function handleAttach() {
  emit('attach');
}

function handleImage() {
  emit('image');
}

function handleVoice() {
  emit('voice');
}

</script>

<template>
  <div class="message-input-container">
    <div class="message-input-wrapper">
      <div class="input-actions">
        <button class="input-btn" @click="handleAttach">
          <i class="fas fa-plus"></i>
        </button>
        <button class="input-btn" @click="handleImage">
          <i class="fas fa-image"></i>
        </button>
        <button class="input-btn" @click="handleVoice">
          <i class="fas fa-microphone"></i>
        </button>
      </div>
      <div class="message-input-area">
        <textarea
          class="message-input"
          placeholder="메시지 입력..."
          rows="1"
          v-model="messageText"
          @input="handleInput"
          @keydown="handleKeydown"
          ref="textarea"
        ></textarea>
        <button
          class="send-btn"
          :disabled="!messageText.trim()"
          @click="sendMessage"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url(../../assets/message/MessageInput.css);
</style>