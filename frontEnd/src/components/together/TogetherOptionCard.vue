<script setup>
import { ref } from 'vue'
import api from '@/api/together'
import CreateTogetherModal from '@/components/together/CreateTogetherModal.vue'
import Modal from '@/components/main/Modal.vue'

const showModal = ref(false)
const showErrorModal = ref(false)
const errorMessage = ref('')
const inviteCode = ref('') // 초대 코드 바인딩
const errorTitle = 'Together 에러'

const closeErrorModal = () => {
  showErrorModal.value = false
}

const openCreateRoomModal = () => {
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const joinRoom = async () => {
  if (!inviteCode.value) {
    errorMessage.value = '초대 코드를 입력하세요.'
    showErrorModal.value = true
    return
  }

  const response = await api.joinTogetherWithCode(inviteCode.value)
  if(response.code !== 200) {
    errorMessage.value = response.message
    showErrorModal.value = true
  } else {
    const roomId = response.data.togetherIdx
    window.location.href = `/together/${roomId}`
  }
}
</script>

<template>
  <div class="option-card">
    <div class="option-icon">
      <i class="fas fa-plus-circle"></i>
    </div>
    <div class="option-content">
      <h3>새 방 만들기</h3>
      <p>새로운 Together 방을 만들어 친구들을 초대하세요</p>
      <button class="btn-option" id="createRoomBtn" @click="openCreateRoomModal">
        <i class="fas fa-plus"></i>
        방 만들기
      </button>
    </div>
  </div>

  <div class="option-card">
    <div class="option-icon">
      <i class="fas fa-sign-in-alt"></i>
    </div>
    <div class="option-content">
      <h3>방 참가하기</h3>
      <p>초대 코드로 친구의 Together 방에 참가하세요</p>
      <div class="join-room-form">
        <input type="text" v-model="inviteCode" id="inviteCode" placeholder="초대 코드 입력" />
        <button class="btn-option" id="joinRoomBtn" @click="joinRoom">
          <i class="fas fa-sign-in-alt"></i>
          참가하기
        </button>
      </div>
    </div>
  </div>
  <!-- 모달 컴포넌트 조건부 렌더링 -->
  <CreateTogetherModal v-if="showModal" :visible="showModal" @close="closeModal" />
  <Modal v-if="showErrorModal" @confirm="closeErrorModal" :title="errorTitle" :message="errorMessage"  />
</template>

<style scoped>
@import url(@/assets/together/togetherOptionCard.css);
</style>
