<script setup>
import {ref, reactive, onMounted} from 'vue'
import { useRoute, useRouter } from 'vue-router'

const searchContext = ref('');
const route = useRoute()
const router = useRouter()

const requset = reactive({
  togethers: []
});

const search = async () => {
  if(!searchContext) {
    alert('검색어를 입력해주세요.')
    return
  }

  await router.push({ name: 'togetherSearch', query: { q: searchContext.value } })
  window.location.reload()
}

onMounted(() => { 
  searchContext.value = route.query.q;
  console.log()
})
</script>

<template>
    <!--  Together Search -->
    <div class="together-search">
        <input type="text" v-model="searchContext" class="search-input" placeholder="Together 검색..." />
        <button class="search-btn" @click="search">
            <i class="fas fa-search"></i>
        </button>
    </div>
</template>

<style scoped>
@import url(@/assets/together/togetherSearch.css);
</style>