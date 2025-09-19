<script setup>
import { computed } from 'vue';

const props = defineProps({
  chatAvatar: {
    type: String,
    required: true
  }
});

const avatarUrl = computed(() => props.chatAvatar.replace('50x50', '32x32'));
</script>

<template>
<div class="typing-indicator">
    <div class="message-avatar">
      <img :src="avatarUrl" alt="Typing">
    </div>
    <div class="typing-content">
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url(../../assets/message/TypingIndicator.css);

</style>