<script setup>
const emit = defineEmits(['new-chat'])

function handleNewChat() {
  emit('new-chat')
}
</script>

<template>
<div class="chat-list-header">
    <h2>메시지</h2>
    <button class="new-chat-btn" @click="handleNewChat">
      <i class="fas fa-plus"></i>
    </button>
  </div>
</template>

<style scoped>
@import url(../../assets/message/ChatListHeader.css);

</style>