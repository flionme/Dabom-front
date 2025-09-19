<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  chatAvatar: {
    type: String,
    required: true
  }
});

const avatarUrl = computed(() => props.chatAvatar.replace('50x50', '32x32'));

const formattedTime = computed(() => {
  const timeParts = props.message.time.split(':');
  return timeParts.length >= 2 ? `${timeParts[0]}:${timeParts[1]}` : props.message.time;
});


</script>

<template>
<div class="message" :class="{ sent: message.sent }">
    <div v-if="!message.sent" class="message-avatar">
      <img :src="avatarUrl" :alt="message.sender">
    </div>
    <div class="message-content-wrapper">
      <div class="message-content">{{ message.content }}</div>
      <div class="message-time">{{ formattedTime }}</div>
    </div>
    <div v-if="message.sent" class="message-avatar">
    </div>
  </div>
</template>

<style scoped>
@import url(../../assets/message/MessageBubble.css);

</style>