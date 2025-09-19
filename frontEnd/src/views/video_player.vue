<script setup>
import VideoMainInfo from '@/components/video-player/video_main_info.vue'
import VideoTagExplain from '@/components/video-player/video_tag_explain.vue'
import VideoComment from '@/components/video-player/video_comment.vue'
import {useRoute} from 'vue-router'
import {onMounted, reactive, ref, onUnmounted} from 'vue'
import Hls from 'hls.js'
import api from '@/api/video_player'
import useMemberStore from '@/stores/useMemberStore' 
import channelApi from "@/api/channel" 

const route = useRoute()
const videoId = route.params.id
const videoPlayer = ref(null)
const memberStore = useMemberStore() 
let hls = null

const videoInfo = reactive({
  idx: '',
  title: '',
  description: '',
  savedPath: '',
  isSubscribed: '',
  channelName: '',
  viewCount: 0,
  videoScore: 0,
  subscribeCount: 0
})

const currentUserProfile = ref({
  profileImg: 'https://via.placeholder.com/40',
  name: '사용자'
})

const loadCurrentUserProfile = async () => {
  try {
    const myChannelName = memberStore.getChannelNameWithEncrypt()
    if (myChannelName) {
      const channelInfoResponse = await channelApi.getChannelInfoByChannelName(myChannelName)
      if (channelInfoResponse) {
        currentUserProfile.value = {
          profileImg: channelInfoResponse.profileImg || 'https://via.placeholder.com/40',
          name: channelInfoResponse.name || '사용자'
        }
      }
    }
  } catch (error) {
  }
}

const getData = async () => {
  const result = await api.getVideoById(videoId)
  Object.assign(videoInfo, result.data)
  console.log(result.data)
  if (videoInfo.savedPath) {
    initHlsPlayer()
  }
}

const initHlsPlayer = () => {
  if (!videoPlayer.value || !videoInfo.savedPath) return

  const video = videoPlayer.value
  const videoUrl = videoInfo.savedPath

  if (hls) {
    hls.destroy()
  }

  if (Hls.isSupported()) {
    hls = new Hls()
    hls.loadSource(videoUrl)
    hls.attachMedia(video)

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log("load hls..")
    })

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS 에러:', data)
    })
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoUrl
  }
}

onMounted(async () => {
  // 데이터 로드를 병렬로 실행
  await Promise.all([
    getData(),
    loadCurrentUserProfile()
  ])
})

onUnmounted(() => {
  if (hls) {
    hls.destroy()
    hls = null
  }
})
</script>

<template>
  <div class="video-page-container">
    <!-- 고정된 비디오 플레이어 섹션 -->
    <div class="video-player-section">
      <div class="video-player-wrapper">
        <video
            ref="videoPlayer"
            class="video-player"
            controls
            muted
            autoplay
        >
          지원하지 않는 비디오 플레이어 입니다.
        </video>
      </div>
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <div class="main-content-area">
      <!-- 좌측 컨텐츠 -->
      <div class="content-column">
        <div class="video-title-section">
          <h1 class="video-title">{{ videoInfo.title }}</h1>
        </div>
        <VideoTagExplain :videoInfo="videoInfo"/>
        <VideoMainInfo :videoInfo="videoInfo"/>
        <!-- 현재 사용자 프로필 정보를 댓글 컴포넌트에 전달 -->
        <VideoComment :current-user-profile="currentUserProfile"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 전체 페이지 컨테이너 */
.video-page-container {
  width: 100%;
  min-height: 100vh;
  background-color: var(--background-color, #1a1a1a);
}

/* 고정된 비디오 플레이어 섹션 */
.video-player-section {
  width: 100vw;
  height: 75vh;
  padding: 0;
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-player-wrapper {
  width: 100vw;
  height: 75vh;
  max-width: none;
  background-color: #000;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
  display: block;
}

/* 메인 컨텐츠 영역 */
.main-content-area {
  width: 85vw;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.content-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}


.video-title {
  color: var(--text-primary, #ffffff);
  font-size: 1.8rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 0;
  word-wrap: break-word;
}
</style>