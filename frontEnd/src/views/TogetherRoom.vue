<script setup>
import TogetherMasterModal from '@/components/together_room/TogetherMasterModal.vue'
import TogetherRoomChat from '@/components/together_room/TogetherRoomChat.vue'
import TogetherRoomNavigator from '@/components/together_room/TogetherRoomNavigator.vue'
import VideoPlayerComponent from '@/components/video-player/video_player_component.vue'
import Modal from '@/components/main/Modal.vue'

import Stomp from 'stompjs'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/together/'
import SockJS from 'sockjs-client'

const socket = ref(null)
const route = useRoute()
const togetherInfo = reactive({
  togetherIdx: 0,
  title: '',
  maxMemberNum: '',
  joinMemberNumber: '',
  master: '',
  isOpen: '',
  userIdx: 0,
  videoUrl: ''
})
const stateModal = reactive({
  chatModal: false,
  masterModal: false,
  togetherModal: false
})
const subscribed = ref(false)
const isMaster = ref(false)
const togetherTitle = "Together 공지"
const togetherMessage = ref("")

const getTogetherInfo = async () => {
  let res = await api.getTogetherInfo(togetherInfo.togetherIdx)
  if (res.code === 200) {
    loadTogetherInfo(res.data)
  }
  if(res.code === 400) {
    togetherMessage.value = res.message
    stateModal.togetherModal = true;
  }
}
const getIsMaster = async () => {
  let res = await api.isMaster(togetherInfo.togetherIdx)
  if (res.code === 200 && res.data.isMaster === true) {
    isMaster.value = true
  }
}
const loadTogetherInfo = (data) => {
  togetherInfo.togetherIdx = data.togetherIdx
  togetherInfo.isOpen = data.isOpen
  togetherInfo.title = data.title
  togetherInfo.master = data.master
  togetherInfo.maxMemberNum = data.maxMemberNum
  togetherInfo.joinMemberNumber = data.joinMemberNumber
  togetherInfo.userIdx = data.userIdx
  togetherInfo.videoUrl = data.videoUrl
  if(togetherInfo.videoUrl === "") {
    togetherInfo.videoUrl = 'https://s3.ap-northeast-2.amazonaws.com/raccoon.aws.s3/encoder/sample/playlist.m3u8'
  }
}
const connectWebSocket = async () => {
  const ws = new SockJS('http://localhost:8080/chat', null,
      {
        transportOptions: {
          xhr: { withCredentials: true },
          xhrStreaming: { withCredentials: true }
        }
      })
  const client = Stomp.over(ws)
  socket.value = client
  socket.value.connect(
      {},
    (frame) => {
      subscribed.value = true
      subscribeMasterEvent()
    },
    (error) => {
    }
  )
}

const subscribeMasterEvent = () => {
  socket.value.subscribe(`/topic/master/control/together/${togetherInfo.togetherIdx}`, (mes) => {
    const data = JSON.parse(mes.body)
    console.log(data)
    if(data.videoUrl !== '') {
      window.location.reload();
    }
    if(data.kickIdx !== '') {
      if(togetherInfo.userIdx === data.kickIdx) {
        togetherMessage.value = "강퇴당하셨습니다."
        stateModal.togetherModal = true;
      }
    }
  });
}

const returnTogether = () => {
  stateModal.togetherModal = false;
  window.location.href = '/together'
}
const openChatModal = () => {
  stateModal.chatModal = true
}
const closeChatModal = () => {
  stateModal.chatModal = false
}
const openMasterModal = () => {
  stateModal.masterModal = true
}
const closeMasterModal = () => {
  stateModal.masterModal = false
}

onMounted(() => {
  togetherInfo.togetherIdx = route.params.id
  getTogetherInfo()
  getIsMaster()
  connectWebSocket()
})

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect()
  }
})
</script>

<template>
  <TogetherRoomNavigator
    :isMaster="isMaster"
    @open_chat_modal="openChatModal()"
    @open_master_modal="openMasterModal()"
  />
  <!-- Main Content -->
  <div class="video-section" id="videoSection">
    <!-- Video Container -->
    <div class="video-container" :class="{ 'modal-open': stateModal.chatModal }">
      <div class="video-player">
        <VideoPlayerComponent v-if="subscribed" :video_url="togetherInfo.videoUrl" :socket="socket"
                                :togetherIdx="togetherInfo.togetherIdx" :isMaster="isMaster"/>
      </div>
    </div>
  </div>
  <TogetherMasterModal
    v-if="stateModal.masterModal"
    :socket="socket"
    @close_modal="closeMasterModal()"
  ></TogetherMasterModal>
  <TogetherRoomChat
    v-if="stateModal.chatModal && subscribed"
    :isMaster="isMaster"
    :socket="socket"
    :userIdx="togetherInfo.userIdx"
    @close_modal="closeChatModal()"
    @open_master_modal="openMasterModal"
  />
  <Modal v-if="stateModal.togetherModal" :title="togetherTitle" :message="togetherMessage" @confirm="returnTogether" />
</template>

<style scoped>
/* 비디오 컨테이너 애니메이션 */
.video-container {
  width: 70vw;
  height: 40vw;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform-origin: 50% 50%;
  margin-left: 5.5rem;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;        /* 내부 영상 비율 유지, 블랙바 자동생성 */
  border-radius: 15px 15px 0 0;
  background: #000;
  display: block;
}
/* 모달이 열릴 때 비디오 축소 효과 */
/* .video-container.modal-open {
    transform: translateX(-150px) scale(0.8) translateY(-83px);
    transform-origin: 50% 50%; /* Y축 중심점 유지 */
/* } */
</style>