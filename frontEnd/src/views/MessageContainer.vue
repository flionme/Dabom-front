<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'; // Import storeToRefs
import ChatList from '../components/message/ChatList.vue'
import ChatWindow from '../components/message/ChatWindow.vue'
import { getChatList, getProfile } from '@/api/chat'
import useMemberStore from "@/stores/useMemberStore";
import { useChatStore } from '@/stores/useChatStore';
import { useSocketStore } from '@/stores/socket';

const memberStore = useMemberStore();
const chatStore = useChatStore();
const socketStore = useSocketStore();

// Use state from the store directly, making it the source of truth
const { chatRooms: chatData } = storeToRefs(chatStore);
const currentChatId = ref('')
const newMessage = ref('')

// 백엔드에서 받은 데이터를 컴포넌트가 쓰기 좋은 형태로 변환하는 함수
async function transformChatListData(backendList, currentMemberIdx) {
  const transformed = {};
  if (!backendList) return transformed;

  const chatPromises = backendList.map(async (item) => {
    const opponent = item.member1Idx === currentMemberIdx
      ? { name: item.member2Name, idx: item.member2Idx } // Add idx here
      : { name: item.member1Name, idx: item.member1Idx }; // Add idx here

    let profileImgUrl = 'https://via.placeholder.com/50x50'; // Default placeholder
    try {
      const profileResponse = await getProfile(opponent.idx);
      if (profileResponse) {
        profileImgUrl = profileResponse;
      }
    } catch (error) {
      console.error(`Failed to fetch profile image for member ${opponent.idx}:`, error);
    }

    return {
      idx: item.idx,
      data: {
        name: opponent.name,
        avatar: profileImgUrl,
        recipientIdx: opponent.idx,
        recipientName: opponent.name,
        lastMessage: item.lastMessage || '대화를 시작해보세요.',
        time: item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        unreadCount: item.unreadCount,
        isOnline: false,
        messages: []
      }
    };
  });

  const results = await Promise.all(chatPromises);
  results.forEach(result => {
    transformed[result.idx] = result.data;
  });

  return transformed;
}

onMounted(async () => {
  // 1. 소켓 연결 시도
  socketStore.connect();

  // 2. 기존 채팅 목록 가져오기
  const response = await getChatList(); // 백엔드 API 호출
  const rawChatList = response.chatRooms; // Access the chatRooms list
  const currentMemberIdx = response.currentMemberIdx; // Get currentMemberIdx from response

  // Find current member's name from the chat list
  let currentMemberName = null;
  if (rawChatList && rawChatList.length > 0) {
    const firstChat = rawChatList[0];
    if (firstChat.member1Idx === currentMemberIdx) {
      currentMemberName = firstChat.member1Name;
    } else if (firstChat.member2Idx === currentMemberIdx) {
      currentMemberName = firstChat.member2Name;
    }
  }

  // Set current member info in chat store
  if (currentMemberIdx && currentMemberName) {
    chatStore.setCurrentMember(currentMemberIdx, currentMemberName);
  } else {
    console.warn('MessageContainer: currentMemberIdx or currentMemberName not found in API response.');
  }

  // Populate the store instead of a local ref
  const transformedData = await transformChatListData(rawChatList, currentMemberIdx);
  chatStore.setChatRooms(transformedData);

  // 첫 번째 채팅방을 기본으로 선택
  if (rawChatList && rawChatList.length > 0) {
    const firstChatId = rawChatList[0].idx.toString();
    currentChatId.value = firstChatId;
    
    const firstChat = chatData.value[firstChatId];
    if (firstChat && firstChat.recipientIdx && firstChat.recipientName) {
      chatStore.setCurrentChatRoom(parseInt(firstChatId), firstChat.recipientIdx, firstChat.recipientName);
    }
  }
});

const currentChat = computed(() => {
  // Read from the store's state
  return chatData.value[currentChatId.value] || null
})

function handleChatSelected(chatId) {
  currentChatId.value = chatId;
  const selectedChat = chatData.value[chatId];
  if (selectedChat && selectedChat.recipientIdx && selectedChat.recipientName) {
    // This will now also reset the unread count via the store's action
    chatStore.setCurrentChatRoom(parseInt(chatId), selectedChat.recipientIdx, selectedChat.recipientName);
  }
}

function handleSendMessage(messageText) {
  const chat = chatData.value[currentChatId.value];
  if (!chat || !messageText.trim()) return;

  // 1. Create the message object for the UI (Optimistic Update)
  const optimisticMessage = {
    id: Date.now(), // Use a temporary ID
    content: messageText,
    sender: chatStore.currentMemberName,
    sent: true, // It's always from the current user
    time: new Date().toLocaleTimeString(),
    isRead: false,
  };

  // 2. Add it to the store so it appears instantly
  chatStore.addMessage(optimisticMessage);

  // 3. Create the DTO for the backend
  const messageDto = {
    roomIdx: chatStore.currentRoomIdx,
    senderIdx: chatStore.currentMemberIdx,
    senderName: chatStore.currentMemberName,
    recipientIdx: chatStore.currentRecipientIdx,
    recipientName: chatStore.currentRecipientName,
    message: messageText,
  };

  // 4. Send to the backend
  socketStore.sendMessage(messageDto);
}

</script>

<template>
    <div class="main-content">
    <div class="messages-container">
      <ChatList 
        :chat-data="chatData" 
        :current-chat-id="currentChatId"
        @chat-selected="handleChatSelected"
      />
      <ChatWindow 
        :current-chat="currentChat"
        :room-idx="currentChatId"
        @send-message="handleSendMessage"
      />
    </div>
  </div>



</template>

<style scoped>
/* @import url(../assets/main/main.css); */
@import url(../assets/message/MessageContainer.css);
</style>

<style>
/* @import url(../assets/main/header.css);
@import url(../assets/main/footer.css); */
</style>
