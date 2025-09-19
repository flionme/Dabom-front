<script setup>
import TogetherCard from '@/components/together/TogetherCard.vue'
import togetherSearch from '@/components/together/TogetherSearch.vue'
import api from '@/api/together'

import {reactive, onMounted, onUnmounted} from 'vue'
import {useRoute} from 'vue-router'
import {sign} from "chart.js/helpers";

const searchContext = reactive({
  search: ''
});
const route = useRoute()
const togethers = reactive({
  togethers: [],
  currentPage: 0,
  notTogetherData: false
})

const loadMoreTogethers = async () => {
  if(!togethers.notTogetherData) {
    const nextPage = togethers.currentPage + 1;
    await getSearchTogethers(nextPage, true);
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

const getSearchTogethers = async (page = 0, append = false) => {
  const res = await api.searchTogether(searchContext.search, page, 3)
  if (res.data.togethers.length < 3) {
    togethers.notTogetherData = true;
  }
  if (append) {
    // 무한 스크롤로 추가 데이터 로드
    togethers.togethers = [...togethers.togethers, ...res.data.togethers];
  } else {
    // 초기 데이터 로드 또는 새로운 검색
    togethers.togethers = res.data.togethers;
  }
  togethers.currentPage = page;
}

onMounted(() => {
  searchContext.search = route.query.q;
  getSearchTogethers()
  window.addEventListener('scroll', throttledScroll, {passive: true});
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
    <togetherSearch/>
    <!-- Active Rooms -->
    <div class="active-rooms">
      <div class="section-header">
        <h2><i class="fas fa-fire"></i> 활성 Together 방</h2>
      </div>
      <!-- 더미 데이터 시작 -->
      <div class="rooms-grid">
        <together-card v-for="together in togethers.togethers" :together="together"/>
      </div>
      <!-- 더미 데이터 종료 -->
    </div>
  </div>
</template>

<style scoped>
@import url('@/assets/together/together.css');
@import url('@/assets/main/main.css');
</style>