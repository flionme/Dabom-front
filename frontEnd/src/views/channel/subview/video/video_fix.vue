<script setup>
import VideoSectionComp from '@/components/videos/VideoSectionComp.vue';
import { onMounted, reactive, computed } from 'vue';
import api from '@/api/video';
import { useRoute } from 'vue-router';

const route = useRoute();

const state = reactive({
  popularVideos: [],
  currentPage: 0,
  size: 10,
  loading: false,
  hasNext: true,
  error: null,
});

const channelName = computed(() => {
  return route.params.channelName ? route.params.channelName : null;
});

const getVideoList = async (page = 0, append = false) => {
  if (state.loading) return;

  try {
    state.loading = true;
    state.error = null;

    const result = await api.getVideoList(page, state.size, '', channelName.value);

    if (append) {
      state.popularVideos = [...state.popularVideos, ...result.content];
    } else {
      state.popularVideos = result.content;
    }

    state.hasNext = result.hasNext;
    state.currentPage = page;

    if (result.content.length === 0 && channelName.value) {
      state.error = `"${channelName.value}"에 대한 동영상이 없습니다.`;
    }

  } catch (error) {
    console.error('비디오 로딩 실패:', error);
    state.error = '비디오를 불러오는데 실패했습니다.';
  } finally {
    state.loading = false;
  }
};

onMounted(() => {
  getVideoList();
});
</script>


<template>
  <div class="video-section">
    <VideoSectionComp :title="'내 동영상'" :icon="'fas fa-fire'" :videos="state.popularVideos"/>
  </div>

</template>


<style scoped>
.layout-container {
  display: flex;
}

.main-content {
  flex: 1;
  margin-top: 3rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 78%;
}

.video-section {
  display: grid;
  margin-left: 1.8rem
}
</style>
