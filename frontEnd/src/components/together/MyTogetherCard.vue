<script setup>
import { useRouter } from 'vue-router'
import { onMounted, reactive, ref } from 'vue'
import UpdateTogetherModal from '@/components/together/UpdateTogetherModal.vue'
import DeleteModal from '@/components/together/DeleteModal.vue'
import api from '@/api/together/'

const router = useRouter()
const props = defineProps(['together', 'isMaster'])
const together = reactive({
  together_id: 0,
  title: '',
  host_name: '',
  thumb_nail: '',
  max_join_people: 0,
  join_people: 0,
  total_play_time: '',
  created: '',
  isOpen: '',
  code: '',
})
const showUpdateModal = ref(false)
const deleteContext = {
  title: '투게더 삭제하기',
  message: '정말로 삭제하시겠습니까?',
}
const deleteModal = ref(false)

const openDeleteModal = () => {
  deleteModal.value = true
}

const closeDeleteModal = () => {
  deleteModal.value = false
}

const openUpdateRoomModal = () => {
  showUpdateModal.value = true
}

const closeUpdateModal = () => {
  showUpdateModal.value = false
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
  together.isOpen = data.isOpen
  together.code = data.code
}

const joinRoom = () => {
  if (together.together_id !== 0) {
    router.push({ name: 'togetherRoom', params: { id: together.together_id } })
  } else {
    console.log('URL이 제공되지 않았습니다.')
  }
}

const deleteTogether = async () => {
  let res
  if (props.isMaster) {
    res = await api.deleteTogether(together.together_id)
  } else {
    res = await api.leaveTogether(together.together_id)
  }
  console.log(res)
  if (res.code === 200) {
    closeDeleteModal()
    window.location.reload();
  }
}

const copyCode = () => {
  navigator.clipboard.writeText(together.code)
}

onMounted(() => {
  getTogether()
})
</script>

<template>
  <div class="my-room-item">
    <div class="room-info">
      <h4>{{ together.title }}</h4>
      <p>
        {{ together.isOpen ? '공개 방' : '비공개 방' }} • {{ together.join_people }}/{{
          together.max_join_people
        }}
        명 참가중
      </p>
      <span class="room-code" v-if="props.isMaster">
        초대 코드: <strong>{{ together.code }}</strong>
        <button class="btn-copy-code" @click="copyCode">
          <i class="fas fa-copy"></i>
        </button>
      </span>
    </div>
    <div class="room-actions">
      <button class="btn-manage" @click="openUpdateRoomModal" v-if="props.isMaster">
        <i class="fas fa-cog"></i>
        관리
      </button>
      <button class="btn-enter" @click="joinRoom">
        <i class="fas fa-sign-in-alt"></i>
        입장
      </button>
      <button class="btn-delete" @click="openDeleteModal">
        <i class="fas fa-trash"></i>
        삭제
      </button>
    </div>
  </div>
  <DeleteModal
    v-if="deleteModal"
    :title="deleteContext.title"
    :message="deleteContext.message"
    @close="closeDeleteModal"
    @confirm="deleteTogether"
  ></DeleteModal>
  <UpdateTogetherModal
    v-if="showUpdateModal"
    :visible="showUpdateModal"
    :together="together"
    @close="closeUpdateModal"
  />
</template>

<style scoped>
@import url(@/assets/together/myTogetherCard.css);
</style>
