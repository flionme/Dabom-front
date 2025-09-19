<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getComments, postComment, deleteComment, videoCommentLikes } from '@/api/videocomment/'

const route = useRoute()
const videoId = ref(route.params.id)

const props = defineProps({
  currentUserProfile: {
    type: Object,
    required: true,
    default: () => ({
      profileImg: 'https://via.placeholder.com/40',
      name: '사용자'
    })
  }
})

const commentText = ref('')
const comments = ref([])
const currentUser = ref(null)
const sortOrder = ref('newest')
const page = ref(0)
const pageSize = 10
const hasMore = ref(true)
const likingComments = ref(new Set())

const loadComments = async (reset = false) => {
  if (!videoId.value) return
  
  if (reset) {
    page.value = 0
    comments.value = []
    hasMore.value = true
  }
  
  try {
    let sortParam = ''
    if (sortOrder.value === 'newest') {
      sortParam = 'createdAt,desc'
    } else if (sortOrder.value === 'oldest') {
      sortParam = 'createdAt,asc'
    } else if (sortOrder.value === 'popular') {
      sortParam = 'likes,desc'
    }

    const response = await getComments(videoId.value, {
      page: page.value,
      size: pageSize,
      sort: sortParam
    })
    
    if (response && response.data && response.data.content) {
        const commentsWithLikes = response.data.content.map(comment => ({
            ...comment,
            isLikes: comment.isLikes || false,
            likesCount: comment.likesCount || 0
        }))
        
        comments.value = reset ? commentsWithLikes : [...comments.value, ...commentsWithLikes]
        hasMore.value = !response.data.last
    } else {
        comments.value = []
        hasMore.value = false
    }
  } catch (error) {
    comments.value = []
    hasMore.value = false
    alert(error.response?.data?.message || '댓글 목록을 불러오는데 실패했습니다.')
  }
}

const submitComment = async () => {
  if (!videoId.value) {
    alert('비디오 ID가 없습니다.')
    return
  }
  
  if (!commentText.value.trim()) {
    alert('댓글을 입력해주세요.')
    return
  }
  
  try {
    await postComment(videoId.value, { content: commentText.value })
    commentText.value = ''
    loadComments(true)
  } catch (error) {
    alert(error.response?.data?.message || '댓글 작성에 실패했습니다.')
  }
}

const handleDeleteComment = async (commentId) => {
  if (!confirm('이 댓글을 삭제하시겠습니까?')) return
  
  try {
    await deleteComment(commentId)
    loadComments(true)
  } catch (error) {
    alert(error.response?.data?.message || '댓글 삭제에 실패했습니다.')
  }
}

const handleCommentLike = async (comment) => {
  if (likingComments.value.has(comment.idx)) return
  
  try {
    likingComments.value.add(comment.idx)
    const response = await videoCommentLikes(comment.idx)
    
    if (response === true || (response && response.data === true) || (response && response.code === 200)) {
      comment.isLikes = !comment.isLikes
      
      if (comment.isLikes) {
        comment.likesCount = (comment.likesCount || 0) + 1
      } else {
        comment.likesCount = Math.max(0, (comment.likesCount || 0) - 1)
      }
    }
  } catch (error) {
    alert('좋아요 처리에 실패했습니다.')
  } finally {
    likingComments.value.delete(comment.idx)
  }
}

const loadMoreComments = () => {
  if (hasMore.value) {
    page.value += 1
    loadComments()
  }
}

const changeSortOrder = () => {
  loadComments(true)
}

watch(() => route.params.id, (newVideoId) => {
  if (newVideoId) {
    videoId.value = newVideoId
    loadComments(true)
  }
}, { immediate: true })

onMounted(() => {
  currentUser.value = { id: 1 }
})
</script>

<template>
  <div class="comments-section">
    <div class="comments-header">
      <h3>댓글 <span class="comment-count">{{ comments.length }}개</span></h3>
      <div class="comment-sort">
        <select class="sort-select" v-model="sortOrder" @change="changeSortOrder">
          <option value="newest">최신순</option>
          <option value="popular">인기순</option>
          <option value="oldest">오래된순</option>
        </select>
      </div>
    </div>

    <div class="comment-write">
      <div class="comment-avatar">
        <img :src="props.currentUserProfile.profileImg" :alt="props.currentUserProfile.name + ' 프로필'" />
      </div>
      <div class="comment-input-area">
        <textarea
            class="comment-textarea"
            placeholder="댓글을 입력해주세요..."
            v-model="commentText"
        ></textarea>
        <div class="comment-actions">
          <button class="action-btn btn-cancel" @click="commentText = ''">취소</button>
          <button class="action-btn btn-message" @click="submitComment">댓글 달기</button>
        </div>
      </div>
    </div>

    <div class="comments-list">
      <div
          class="comment-item"
          v-for="comment in comments"
          :key="comment.idx"
      >
        <div class="comment-avatar">
          <img
              :src="comment.profileImg || 'https://via.placeholder.com/40'"
              alt="사용자"
          />
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="commenter-name">{{ comment.username }}</span>
            <span class="comment-time">{{ comment.createdAt }}</span>
          </div>
          <p class="comment-text">{{ comment.content }}</p>
          
          <!-- 좋아요 버튼을 댓글 내용 바로 밑으로 분리 -->
          <div class="comment-like-section">
            <button 
              class="comment-action-btn like-btn"
              :class="{ 
                'liked': comment.isLikes,
                'processing': likingComments.has(comment.idx)
              }"
              :disabled="likingComments.has(comment.idx)"
              @click="handleCommentLike(comment)"
            >
              <i 
                class="fas fa-thumbs-up" 
                :style="{ color: comment.isLikes ? '#ff3040' : '#888' }"
              ></i>
              <span>{{ comment.likesCount || 0 }}</span>
            </button>
          </div>
          
          <!-- 삭제 버튼은 별도 영역에 유지 -->
          <div class="comment-actions" v-if="currentUser && currentUser.id === comment.memberIdx">
            <button
                class="comment-btn delete-btn"
                @click="handleDeleteComment(comment.idx)"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="load-more" v-if="hasMore">
      <button class="action-btn btn-load-more" @click="loadMoreComments">더 보기</button>
    </div>
  </div>
</template>

<style scoped>
@import url(../../assets/Video_Player/Video_Player.css);

.delete-btn {
  color: #ff4d4f;
  margin-left: 8px;
}

.btn-load-more {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.btn-load-more:hover {
  background-color: #0056b3;
}

/* 댓글 좋아요 섹션 - 댓글 내용 바로 밑에 위치 */
.comment-like-section {
  margin-top: 8px;
  margin-bottom: 8px;
}

.comment-action-btn {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.comment-action-btn:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.comment-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.comment-action-btn.liked {
  color: #ff3040;
}

.comment-action-btn.processing {
  opacity: 0.7;
}

.comment-action-btn i {
  font-size: 0.75rem;
  transition: color 0.3s ease;
}

/* 댓글 액션 버튼들 (삭제 등) */
.comment-actions {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
}
</style>