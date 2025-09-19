<script setup>
import { computed } from 'vue'
import OnlineStatus from './OnlineStatus.vue'

const props = defineProps({
  chat: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['call', 'video-call', 'more'])

const avatarUrl = computed(() => props.chat.avatar.replace('50x50', '40x40'))

function handleCall() {
  emit('call')
}
function handleVideoCall() {
  emit('video-call')
}
function handleMore() {
  emit('more')
}
</script>

<template>
    <div class="chat-header">
        <div class="chat-header-info">
            <div class="chat-header-avatar">
                <img :src="avatarUrl" :alt="chat.name">
                <OnlineStatus v-if="chat.isOnline" />
            </div>
            <div class="chat-header-details">
                <h3>{{ chat.name }}</h3>
                <div class="chat-header-status">{{ chat.status }}</div>
            </div>
        </div>
        <div class="chat-actions">
            <button class="chat-action-btn" @click="handleCall">
        <i class="fas fa-phone"></i>
    </button>
    <button class="chat-action-btn" @click="handleVideoCall">
        <i class="fas fa-video"></i>
    </button>
    <button class="chat-action-btn" @click="handleMore">
        <i class="fas fa-ellipsis-v"></i>
    </button>
</div>
</div>
</template>

<style scoped>
@import url(../../assets/message/ChatHeader.css);
</style>