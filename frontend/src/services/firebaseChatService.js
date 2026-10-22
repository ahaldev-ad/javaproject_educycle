import { rtdb } from '../firebase';
import { ref, push, set, onValue, off } from 'firebase/database';

export const firebaseChatService = {
  /**
   * Listen in real-time to messages for a specific request match.
   * @param {string|number} requestId
   * @param {string|number} currentUserId
   * @param {string} currentUserEmail
   * @param {function} onMessagesReceived Callback receiving formatted message list
   * @param {function} onError Optional error callback
   * @returns {function} Unsubscribe cleanup function
   */
  subscribeToChat: (requestId, currentUserId, currentUserEmail, onMessagesReceived, onError) => {
    if (!requestId) return () => {};
    const chatRef = ref(rtdb, `chats/${requestId}/messages`);

    const handleValue = (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        onMessagesReceived([]);
        return;
      }

      const list = Object.keys(data).map((key) => {
        const item = data[key];
        const isMine =
          (currentUserId && item.senderId === currentUserId) ||
          (currentUserEmail && item.senderEmail === currentUserEmail);

        return {
          id: key,
          ...item,
          isMine
        };
      });

      // Sort chronologically by timestamp
      list.sort((a, b) => {
        const timeA = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime();
        const timeB = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime();
        return timeA - timeB;
      });

      onMessagesReceived(list);
    };

    const handleError = (error) => {
      console.error("Firebase Realtime Database listen error:", error);
      if (onError) onError(error);
    };

    onValue(chatRef, handleValue, handleError);

    return () => {
      off(chatRef, 'value', handleValue);
    };
  },

  /**
   * Send a new message to the real-time chat for a request match.
   * @param {string|number} requestId
   * @param {object} messageData { senderId, senderName, senderEmail, messageText }
   */
  sendMessage: async (requestId, messageData) => {
    if (!requestId) throw new Error("Missing requestId");
    const chatRef = ref(rtdb, `chats/${requestId}/messages`);
    const newMsgRef = push(chatRef);

    const payload = {
      senderId: messageData.senderId || null,
      senderName: messageData.senderName || 'Student Peer',
      senderEmail: messageData.senderEmail || '',
      messageText: messageData.messageText || '',
      timestamp: Date.now()
    };

    await set(newMsgRef, payload);
    return { id: newMsgRef.key, ...payload, isMine: true };
  }
};
