import { ref } from 'vue';
import { defineStore } from 'pinia';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useChatStore } from './useChatStore';
import together from '@/api/together'; // 올바른 import 방식으로 수정

export const useSocketStore = defineStore('socket', () => {
  const stompClient = ref(null);
  const isConnected = ref(false);

  async function getJWT() {
    try {
      const tokenData = await together.getToken();
      const jwt = tokenData['authorization']; // 헤더에서 JWT 추출
      if (!jwt) {
        
        return null;
      }
      return jwt;
    } catch (error) {
      
      return null;
    }
  }

  async function connect() {
    if (isConnected.value) {
      
      return;
    }

    const jwt = await getJWT();

    const chatStore = useChatStore();
    const socket = new SockJS('http://localhost:8080/chat');
    stompClient.value = Stomp.over(socket);

    // Set the JWT as a cookie for the backend's JwtHandShakeInterceptor
    if (jwt) {
      document.cookie = `ACCESS_TOKEN=${jwt}; path=/;`; // Set path to root for WebSocket
    }

    stompClient.value = Stomp.over(socket);

    stompClient.value.connect(
      {}, // No headers needed here, JWT is in cookie
      (frame) => {
        
        isConnected.value = true;
        

        stompClient.value.subscribe('/user/queue/messages', (message) => {
          
          const messageData = JSON.parse(message.body);
          
          
          
          const transformedMessage = {
            id: messageData.createdAt || Date.now(),
            content: messageData.message,
            sender: messageData.senderName,
            sent: String(messageData.senderIdx) === String(chatStore.currentMemberIdx),
            time: new Date(messageData.createdAt).toLocaleTimeString(),
            isRead: messageData.isRead,
          };

          
          chatStore.addMessage(transformedMessage);
          
        });
      },
      (error) => {
        
        isConnected.value = false;
        stompClient.value = null;
      }
    );
  }

  function disconnect() {
    if (stompClient.value) {
      stompClient.value.disconnect(() => {
        
        isConnected.value = false;
        stompClient.value = null;
      });
    }
  }

  function sendMessage(messageDto) {
    if (stompClient.value && isConnected.value) {
      

      stompClient.value.send(
        '/app/chat/send',
        {},
        JSON.stringify(messageDto)
      );
    } else {
      
    }
  }

  return {
    stompClient,
    isConnected,
    connect,
    disconnect,
    sendMessage,
  };
});
