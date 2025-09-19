<script setup>
import { ref, onMounted, onUpdated, nextTick, watch } from 'vue';
import MessageBubble from './MessageBubble.vue';
import TypingIndicator from './TypingIndicator.vue';
import api from '@/api/chat';
import { useSocketStore } from '@/stores/socket'; // 스토어 임포트
import { useChatStore } from '@/stores/useChatStore'; // 스토어 임포트

const socketStore = useSocketStore(); // 스토어 사용
const chatStore = useChatStore(); // 스토어 사용

const props = defineProps({
  roomIdx: {
    type: [String, Number],
    required: true,
  },
  chatAvatar: {
    type: String,
    required: true,
  },
  isTyping: {
    type: Boolean,
    default: false,
  },
});

const messagesContainer = ref(null);
const page = ref(0);
const size = ref(20);
const hasNext = ref(true);
const isLoading = ref(false);

// Watch for roomIdx changes to load new chat messages
watch(() => props.roomIdx, (newRoomIdx, oldRoomIdx) => {
  console.log(`MessageList: roomIdx changed from ${oldRoomIdx} to ${newRoomIdx}.`);
  if (newRoomIdx && newRoomIdx !== oldRoomIdx) {
    console.log('MessageList: Triggering message reset and load.');
    resetAndLoadMessages();
  } else if (newRoomIdx && !oldRoomIdx) {
    console.log('MessageList: Initial room load, triggering message reset and load.');
    resetAndLoadMessages();
  }
}, { immediate: true });

// Watch for new messages in the chat store to scroll down
watch(() => chatStore.messages.length, (newLength, oldLength) => {
  if (newLength > oldLength) {
    scrollToBottom();
  }
});

async function loadMoreMessages() {
  if (isLoading.value || !hasNext.value) return;
  if (!props.roomIdx) {
    console.warn('MessageList: loadMoreMessages called with no roomIdx. Aborting.');
    return;
  }
  isLoading.value = true;
  try {
    console.log(`MessageList: Fetching messages for room ${props.roomIdx}, page ${page.value}`);
    const data = await api.getChatRoom(props.roomIdx, page.value, size.value);
    console.log('MessageList: API response received:', data);

    if (data && data.content && data.content[0] && data.content[0].chatList) {
      const newMessages = data.content[0].chatList.map((msg) => ({
        id: msg.createdAt,
        content: msg.message,
        sender: msg.senderName,
        sent: String(msg.senderIdx) === String(chatStore.currentMemberIdx),
        time: new Date(msg.createdAt).toLocaleTimeString(),
        isRead: msg.isRead,
      }));
      console.log(`MessageList: Mapped ${newMessages.length} new messages.`);
      // Prepend older messages, ensuring chronological order
      chatStore.setMessages([...newMessages.reverse(), ...chatStore.messages]);
      hasNext.value = data.hasNext;
      page.value += 1;
    } else {
      console.log('MessageList: No new messages in response or response format is unexpected.');
      hasNext.value = false; // Stop fetching if there's no content
    }
  } catch (error) {
    console.error('MessageList: Failed to load messages:', error);
  } finally {
    isLoading.value = false;
  }
}

async function resetAndLoadMessages() {
  chatStore.clearMessages();
  page.value = 0;
  hasNext.value = true;
  await loadMoreMessages();
  scrollToBottom();
}

function scrollToBottom() {
  nextTick(() => {
    const container = messagesContainer.value;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
}

function setupIntersectionObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasNext.value) {
        loadMoreMessages();
      }
    },
    { threshold: 0.1 }
  );
  nextTick(() => {
    const container = messagesContainer.value;
    if (container && container.firstChild) {
      observer.observe(container.firstChild);
    }
  });
}

onMounted(() => {
  // The immediate watch now handles all loading, including initial.
  setupIntersectionObserver();
});

</script>

<template>
  <div class="chat-messages" ref="messagesContainer">
    <MessageBubble
      v-for="message in chatStore.messages"
      :key="message.id"
      :message="message"
      :chat-avatar="props.chatAvatar"
    />
    <TypingIndicator v-if="props.isTyping" :chat-avatar="props.chatAvatar" />
  </div>
</template>

<style scoped>
@import url(../../assets/message/MessageList.css);
</style>