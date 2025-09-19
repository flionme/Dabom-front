<script setup>
import { reactive, onMounted } from 'vue';
import api from '@/api/video_player';

let data = reactive([]); 

const getData = async () => {
    try {
        const response = await api.getRecommendVideo();

        if (Array.isArray(response)) {
            data.splice(0, data.length, ...response.map(item => ({
                title: item.title,
                thumbnail: item.thumbnail || 'https://via.placeholder.com/150x100',
                channel: item.channel || 'Unknown Channel',
                views: item.views || '0',
                rating: item.rating || 0
            })));
        }
    } catch (error) {
        console.error("추천 비디오를 불러오는 중 오류 발생:", error);
    }
};

onMounted(() => {
    getData();
});

</script>

<template>
    <div class="recommended-sidebar">
        <h3 class="sidebar-title">추천 영상</h3>
        <div class="recommended-videos">
            <div class="recommended-video" v-for="video in data" :key="video.title">
                <div class="recommended-thumbnail">
                    <img :src="video.thumbnail" :alt="video.title">
                    <!-- <div class="video-duration">8:45</div> 비디오 길이는 JSON에 없으므로 임시로 주석 처리 -->
                </div>
                <div class="recommended-info">
                    <h4 class="recommended-title">{{ video.title }}</h4>
                    <p class="recommended-channel">{{ video.channel }}</p>
                    <div class="recommended-meta">
                        <span class="view-count">{{ video.views }} 조회</span>
                        <div class="star-rating small">
                            <template v-for="n in 5">
                                <i v-if="video.rating >= n" class="fas fa-star"></i>
                                <i v-else-if="video.rating >= n - 0.5" class="fas fa-star-half-alt"></i>
                                <i v-else class="far fa-star"></i>
                            </template>
                            <span class="rating-score">{{ video.rating }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>
@import url(../../assets/Video_Player/Video_Player.css);

</style>