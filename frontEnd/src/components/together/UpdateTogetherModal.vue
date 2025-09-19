<script setup>
import {onMounted, reactive} from 'vue'
import {useRouter} from "vue-router";
import api from '@/api/together'

const router = useRouter()
const props = defineProps(['visible', 'together'])
// Events 정의[17][20]
const emit = defineEmits(['close'])
let initialData = {};
const roomBody = reactive({
  together_id: 0,
  title: "",
  videoUrl: "",
  maxMemberNumber: "",
  isOpen: "true"
})

const getTogether = () => {
  const data = props.together
  console.log(data)

  roomBody.together_id = data.together_id
  roomBody.title = data.title
  roomBody.maxMemberNumber = data.max_join_people
  roomBody.isOpen = data.isOpen
}

// 모달 닫기 함수
const closeModal = () => {
  emit('close')
}

// 배경 클릭시 모달 닫기
const handleBackdropClick = (event) => {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}

const updateTogetherTitle = async () => {
  let res = await api.changeTogetherTitle(roomBody.together_id, roomBody.title);
  return res.code === 200;
}

const updateTogetherMaxMember = async () => {
  let res = await api.changeTogetherMaxMember(roomBody.together_id, roomBody.maxMemberNumber);
  return res.code === 200;
}

const updateTogetherIsOpen = async () => {
  let res = await api.changeTogetherIsOpen(roomBody.together_id, roomBody.isOpen);
  return res.code === 200;
}

const updateTogetherVideo = async () => {
  let res = await api.changeTogetherVideo(roomBody.together_id, roomBody.videoUrl);
  return res.code === 200;
}

// 방 만들기 버튼 클릭 시 데이터 전송
const sendApi = async () => {
  let isChanged = false;

  // 제목 변경 확인
  if (roomBody.title !== initialData.title) {
    await updateTogetherTitle();
    isChanged = true;
  }

  // 최대 인원 변경 확인
  if (roomBody.maxMemberNumber !== initialData.maxMemberNumber) {
    await updateTogetherMaxMember();
    isChanged = true;
  }

  // 공개 여부 변경 확인
  if (roomBody.isOpen !== initialData.isOpen) {
    await updateTogetherIsOpen();
    isChanged = true;
  }

  // 비디오 URL 변경 확인
  if (roomBody.videoUrl !== initialData.videoUrl) {
    await updateTogetherVideo();
    isChanged = true;
  }

  if (isChanged) {
    alert("방을 수정했습니다.")
    closeModal()
    router.go(0)
  } else {
    alert("변경사항이 없습니다.")
  }
}

onMounted(() => {
  getTogether()
  initialData = {...roomBody}
})
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
        <h3><i class="fas fa-plus"></i> Together 수정 </h3>
        <button class="modal-close" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form class="create-room-form" @submit.prevent="closeModal">
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
              <input type="radio" name="roomPrivacy" value="true" v-model="roomBody.isOpen"/>
              <span class="radio-mark"></span>
              <div class="radio-content">
                <strong>공개 방</strong>
                <span>모든 사용자가 참가할 수 있습니다</span>
              </div>
            </label>
            <label class="radio-item">
              <input type="radio" name="roomPrivacy" value="false" v-model="roomBody.isOpen"/>
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
          <button type="submit" class="btn-create" @click="sendApi">
            <i class="fas fa-plus"></i>
            수정 완료
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@import url(@/assets/together/createTogetherModal.css);
</style>
