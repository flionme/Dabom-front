<script setup>
const props = defineProps(['videoInfo']);

</script>

<template>
    <!-- 영상 설명 및 태그 -->
    <div class="video-description">
        <div class="description-content">
            <p> {{props.videoInfo.description}}</p>
            <div class="video-tags">
                <span class="tag" v-for="tag in props.videoInfo.tags" :key="tag"> {{tag}} </span>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url(@/assets/Video_Player/Video_Player.css);

</style>