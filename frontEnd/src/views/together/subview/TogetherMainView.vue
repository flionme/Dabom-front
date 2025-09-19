<script setup>
import togetherSearch from '@/components/together/TogetherSearch.vue'
import TogetherCard from '@/components/together/TogetherCard.vue'
import MyTogetherCard from '@/components/together/MyTogetherCard.vue'
import TogetherOptionCard from '@/components/together/TogetherOptionCard.vue'
import api from '@/api/together'

import {reactive, onMounted, onUnmounted} from 'vue'

const togethers = reactive({
  randomTogethers: [],
  masterTogethers: [],
  joinTogethers: [],
  currentPage: 0,
  notTogetherData: false
})

const getMyTogethers = async () => {
  const res = await api.getTogetherListInMaster()
  if (res.code === 200) {
    togethers.masterTogethers.push(...res.data.togethers)
  } else {
    console.log('error')
  }
}

const loadMoreTogethers = async () => {
  if(!togethers.notTogetherData) {
    const nextPage = togethers.currentPage + 1;
    await getTogethers(nextPage, true);
  }
}

// 스크롤 이벤트 핸들러
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  // 페이지 하단에서 200px 전에 미리 로드
  const threshold = 200;
  const shouldLoadMore = scrollTop + windowHeight >= documentHeight - threshold;

  if (shouldLoadMore) {
    loadMoreTogethers();
  }
}

// 스크롤 이벤트 스로틀링 (성능 최적화)
let scrollTimer = null;
const throttledScroll = () => {
  if (scrollTimer) return;

  scrollTimer = setTimeout(() => {
    handleScroll();
    scrollTimer = null;
  }, 100); // 100ms마다 실행
}

const getJoinTogethers = async () => {
  const res = await api.getTogetherListInMember()
  if (res.code === 200) {
    togethers.joinTogethers.push(...res.data.togethers)
  } else {
    console.log('error')
  }
}

const getTogethers = async (page = 0, append = false) => {
  const res = await api.getRandomTogetherListTest(page, 3)
  if(res.data.togethers.length < 3) {
    togethers.notTogetherData = true;
  }
  if (append) {
    // 무한 스크롤로 추가 데이터 로드
    togethers.randomTogethers = [...togethers.randomTogethers, ...res.data.togethers];
  } else {
    // 초기 데이터 로드 또는 새로운 검색
    togethers.randomTogethers = res.data.togethers;
  }
  togethers.currentPage = page;
}

onMounted(() => {
  getTogethers()
  getMyTogethers()
  getJoinTogethers()
  // 스크롤 이벤트 리스너 등록
  window.addEventListener('scroll', throttledScroll, { passive: true });
})

onUnmounted(() => {
  // 스크롤 이벤트 리스너 제거
  window.removeEventListener('scroll', throttledScroll);

  // 타이머 정리
  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }
})
</script>

<template>
  <div class="together-container">
    <togetherSearch />
    <!-- Together Room Options -->
    <div class="room-options">
      <TogetherOptionCard />
    </div>

    <!-- My Rooms -->
    <div class="my-rooms">
      <div class="section-header">
        <h2><i class="fas fa-user"></i> 내가 만든 방</h2>
      </div>
      <!-- 더미 데이터 시작 -->
      <div class="my-rooms-list">
        <MyTogetherCard v-for="together in togethers.masterTogethers" :together="together" :isMaster="true" />
      </div>
      <!-- 더미 데이터 종료 -->
    </div>
    <div class="my-rooms">
      <div class="section-header">
        <h2><i class="fas fa-user"></i> 내가 참여하고 있는 방</h2>
      </div>
      <!-- 더미 데이터 시작 -->
      <div class="my-rooms-list">
        <MyTogetherCard v-for="together in togethers.joinTogethers" :together="together" :isMaster="false" />
      </div>
      <!-- 더미 데이터 종료 -->
    </div>
    <!-- Active Rooms -->
    <div class="active-rooms">
      <div class="section-header">
        <h2><i class="fas fa-fire"></i> 활성 Together 방</h2>
      </div>
      <!-- 더미 데이터 시작 -->
      <div class="rooms-grid">
        <together-card v-for="together in togethers.randomTogethers" :together="together" />
      </div>
      <!-- 더미 데이터 종료 -->
    </div>
  </div>
</template>

<style scoped>
@import url('@/assets/together/together.css');
@import url('@/assets/main/main.css');
</style>
