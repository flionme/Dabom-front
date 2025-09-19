<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import Hls from 'hls.js'

const props = defineProps(['video_url', 'is_open_modal', 'socket', 'togetherIdx', 'isMaster'])

const videoPlayer = ref(null)
let hls = null
let videoUrl = ''

const addMasterSubscription = () => {
  if (props.socket && props.socket.connected) {
    const masterSubscription = props.socket.subscribe(`/topic/master/together/${props.togetherIdx}`, (msg) => {
      try {
        console.log('마스터 메시지:', msg)
        const data = JSON.parse(msg.body)
        if(!props.isMaster){
          videoMove(data)
        }
      } catch(e) {
        console.error("마스터 메시지 파싱 실패", e)
      }
    })

    // 구독 해제를 위해 저장
    onUnmounted(() => {
      if (masterSubscription) {
        masterSubscription.unsubscribe()
      }
    })
  }
}

const videoMove = (data) => {
  videoPlayer.value.currentTime = data.currentTime
  videoPlayer.value.play()
}

const sendMessage = () => {
  let body
  console.log(videoPlayer.value.currentTime)
  if (props.isMaster) {
    body = {
      "currentTime": videoPlayer.value.currentTime,
    }
    props.socket.send(`/app/master/together/${props.togetherIdx}`, {}, JSON.stringify(body))
    videoPlayer.value.play()
  }
}

const initHlsPlayer = () => {
  videoUrl = props.video_url

  if (!videoPlayer.value) return

  // 기존 HLS 인스턴스가 있다면 정리
  if (hls) {
    hls.destroy()
    hls = null
  }

  // HLS가 지원되는지 확인
  if (Hls.isSupported()) {
    hls = new Hls({
      enableWorker: false,
      lowLatencyMode: true,
      backBufferLength: 90,
    })

    // HLS 설정
    hls.loadSource(videoUrl)
    hls.attachMedia(videoPlayer.value)

    // HLS 이벤트 리스너
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log('HLS manifest parsed, ready to play')
    })

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS Error:', data)

      // 치명적인 에러인 경우 복구 시도
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.log('Network error, trying to recover...')
            hls.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log('Media error, trying to recover...')
            hls.recoverMediaError()
            break
          default:
            console.log('Fatal error, destroying HLS...')
            hls.destroy()
            break
        }
      }
    })
  } else if (videoPlayer.value.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari 등에서 네이티브 HLS 지원하는 경우
    videoPlayer.value.src = videoUrl
  } else {
    console.error('HLS is not supported in this browser')
  }
}

// video_url prop이 변경될 때마다 플레이어 재초기화
watch(
  () => props.video_url,
  (newUrl) => {
    if (newUrl) {
      initHlsPlayer()
    }
  },
)

onMounted(() => {
  initHlsPlayer()
  if (props.socket && props.socket.connected) {
    addMasterSubscription()
  }
})

onUnmounted(() => {
  // 컴포넌트가 언마운트될 때 HLS 인스턴스 정리
  if (hls) {
    hls.destroy()
    hls = null
  }
})
</script>

<template>
  <video
    id="mainVideoPlayer"
    ref="videoPlayer"
    class='video-player'
    controls
    playsinline
    @seeked="sendMessage"
  >
  </video>
</template>

<style scoped>
.video-player {
  width: 100%;
  height: 100%;
  background-color: #000;
  border-radius: 15px 15px 0 0;
}
</style>