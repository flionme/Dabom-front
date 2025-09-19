<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import HeaderComp from '@/components/main/HeaderComp.vue';
import FooterComp from '@/components/main/FooterComp.vue';

const route = useRoute();

const showFooter = computed(() => {
  return route.name !== 'message';
});

</script>

<template>
  <HeaderComp />
  <RouterView />
  <FooterComp v-if="showFooter" />
</template>

<style scoped></style>
