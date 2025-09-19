<script setup>
import {nextTick, reactive, ref} from 'vue'
import {useRouter} from "vue-router";
import Modal from '@/components/main/Modal.vue'
import api from '@/api/together'

const router = useRouter()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['close'])
const roomBody = reactive({
  title: "",
  videoUrl: "",
  maxMemberNumber: "",
  isOpen: ""
})
const showErrorModal = ref(false)
const errorMessage = ref('')
const errorTitle = 'Together 생성 에러'

const closeErrorModal = () => {
  showErrorModal.value = false
}

const closeModal = () => {
  emit('close')
}

// 배경 클릭시 모달 닫기
const handleBackdropClick = (event) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const saveTogetherRoom = async () => {
  let res = await api.saveTogether(roomBody);
  if(res.code === 200) {
    return res.data.togetherIdx;
  }
  await nextTick()
  errorMessage.value = res.message
  showErrorModal.value = true
  return null;
}

// 방 만들기 버튼 클릭 시 데이터 전송
const sendApi = async () => {
  let idx = await saveTogetherRoom()
  if(!showErrorModal.value) {
    alert("방을 생성했습니다.")
    closeModal()
    router.push({ name: 'togetherRoom', params: {id: idx}})
  }
  console.log(errorMessage.value)
  console.log(showErrorModal.value)
}
</script>

<template>
  <div 
    v-if="visible" 
    class="modal-backdrop" 
    @click="handleBackdropClick"
  ></div>
  
  <div class="create-room-modal">
    <div class="modal-overlay" @click="closeModal"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3><i class="fas fa-plus"></i> Together 방 만들기</h3>
        <button class="modal-close" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <Modal v-if="showErrorModal" @confirm="closeErrorModal" :title="errorTitle" :message="errorMessage"  />
      <form class="create-room-form" @submit.prevent="sendApi">
        <!-- 방 이름 입력 -->
        <div class="form-group">
          <label for="roomName">방 이름 *</label>
          <input
            id="roomName"
            type="text"
            required
            maxlength="50"
            placeholder="방 이름을 입력하세요"
            v-model="roomBody.title"
          />
          <div class="char-count"><span>0</span>/50</div>
        </div>

        <!-- 동영상 URL 입력 -->
        <div class="form-group">
          <label for="videoUrl">동영상 URL</label>
          <input
            id="videoUrl"
            type="url"
            placeholder="함께 볼 동영상 URL을 입력하세요 (선택사항)"
            v-model="roomBody.videoUrl"
          />
          <div class="help-text">나중에 방에서 동영상을 선택할 수도 있습니다</div>
        </div>

        <!-- 최대 참가자 수 -->
        <div class="form-group">
          <label for="maxUser">최대 참가자 수 *</label>
          <input
            id="maxUser"
            type="text"
            placeholder="Together 최대 인원 수를 입력하세요"
            v-model="roomBody.maxMemberNumber"
          />
        </div>

        <!-- 공개 설정 -->
        <div class="form-group">
          <label>방 공개 설정</label>
          <div class="radio-group">
            <label class="radio-item">
              <input type="radio" name="roomPrivacy" value="true" v-model="roomBody.isOpen" />
              <span class="radio-mark"></span>
              <div class="radio-content">
                <strong>공개 방</strong>
                <span>모든 사용자가 참가할 수 있습니다</span>
              </div>
            </label>
            <label class="radio-item">
              <input type="radio" name="roomPrivacy" value="false" v-model="roomBody.isOpen" />
              <span class="radio-mark"></span>
              <div class="radio-content">
                <strong>비공개 방</strong>
                <span>초대한 친구들만 참가할 수 있습니다</span>
              </div>
            </label>
          </div>
        </div>

        <!-- 모달 푸터(버튼) -->
        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="closeModal">취소</button>
          <button type="submit" class="btn-create">
            <i class="fas fa-plus"></i>
            방 만들기
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@import url(@/assets/together/createTogetherModal.css);
</style>
