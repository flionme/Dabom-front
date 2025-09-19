<script setup>
import { useRouter } from 'vue-router'
import { reactive, onMounted, ref } from 'vue'
import Modal from '@/components/main/Modal.vue'
import api from '@/api/together/'

const router = useRouter()
const showErrorModal = ref(false)
const props = defineProps(['together']);
const together = reactive({
  together_id: 0,
  title: '',
  host_name: '',
  thumb_nail: '',
  max_join_people: 0,
  join_people: 0,
  total_play_time: "",
  created: ""
})
const errorTitle = 'Together 에러'
const errorMessage = ref('')

const closeErrorModal = () => {
  showErrorModal.value = false
}

const getTogether = () => {
  const data = props.together
  
  together.together_id = data.togetherIdx
  together.title = data.title
  together.host_name = data.master.name
  together.thumb_nail = data.thumb_nail
  together.max_join_people = data.maxMemberNum
  together.join_people = data.joinMemberNumber
  together.total_play_time = data.total_play_time
  together.created = data.created
}

const joinRoom = async () => {
  if (together.together_id !== 0) {
    let res = await api.joinOpenTogether(together.together_id);
    if(res.code === 200) {
      await router.push({ name: 'togetherRoom', params: {id: together.together_id}})
    } else {
      errorMessage.value = res.message
      showErrorModal.value = true
    }
  } else {
    console.log('URL이 제공되지 않았습니다.')
  }
}

onMounted(() => { 
    getTogether();
})
</script>

<template>
  <div class="room-card">
    <div class="room-thumbnail">
      <img :src="together.thumb_nail" alt="동영상 썸네일" />
      <div class="room-status">
        <span class="live-indicator">LIVE</span>
        <span class="participant-count">
          <i class="fas fa-users"></i>
          {{together.join_people}}/{{ together.max_join_people }}
        </span> 
      </div>
      <div class="video-duration">{{together.total_play_time}}</div>
    </div>
    <div class="room-info">
      <h4 class="room-title">{{ together.title }}</h4>
      <p class="room-host">
        <i class="fas fa-crown"></i>
        {{together.host_name}}
      </p>
      <div class="room-meta">
        <!-- <span class="room-type">
          <i class="fas fa-lock"></i>
          친구만
        </span> -->
        <span class="room-created">{{together.created}}</span>
      </div>
      <div class="room-participants">
        <div class="participant-avatars">
          <img src="https://via.placeholder.com/30x30" alt="참가자" class="participant-avatar" />
          <img src="https://via.placeholder.com/30x30" alt="참가자" class="participant-avatar" />
        </div>
      </div>
      <button class="btn-join-room" data-room-id="2"  @click="joinRoom">
        <i class="fas fa-sign-in-alt"></i>
        방 참가하기
      </button>
    </div>
  </div>
  <Modal v-if="showErrorModal" @confirm="closeErrorModal" :title="errorTitle" :message="errorMessage"  />
</template>

<style scoped>
@import url(@/assets/together/togetherCard.css);
</style>
