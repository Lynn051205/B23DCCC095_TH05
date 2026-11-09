/**
 * conversationService.ts
 * Quản lý danh sách cuộc trò chuyện và số tin nhắn chưa đọc.
 *
 * Cấu trúc DB:
 *   conversations/{uid}/{chatId}
 *     partnerId, lastMessage, lastMessageAt, unreadCount
 *
 * Logic unreadCount:
 *   - Tăng khi nhận tin nhắn từ đối phương và KHÔNG đang mở cuộc trò chuyện đó.
 *   - Không tăng khi chính người dùng gửi tin.
 *   - Reset về 0 khi mở cuộc trò chuyện.
 *   - Mỗi uid quản lý unreadCount riêng → không ghi đè của nhau.
 */
import {
  ref,
  onValue,
  set,
  update,
  serverTimestamp,
  Unsubscribe,
  increment,
} from 'firebase/database';
import {database} from './firebase';

export interface ConversationSummary {
  chatId: string;
  partnerId: string;
  lastMessage: string;
  lastMessageAt: number;
  unreadCount: number;
}

/**
 * Cập nhật summary cuộc trò chuyện khi có tin nhắn mới.
 * Gọi từ màn hình Chat sau khi gửi hoặc nhận tin.
 *
 * @param isIncomingAndNotViewing - true nếu tin đến từ đối phương VÀ người dùng KHÔNG đang mở cuộc trò chuyện đó
 */
export async function updateConversationSummary(
  myUid: string,
  chatId: string,
  partnerId: string,
  lastMessage: string,
  isIncomingAndNotViewing: boolean,
): Promise<void> {
  const convRef = ref(database, `conversations/${myUid}/${chatId}`);

  if (isIncomingAndNotViewing) {
    // Dùng increment để tránh race condition khi hai thiết bị cùng ghi
    await update(convRef, {
      partnerId,
      lastMessage,
      lastMessageAt: serverTimestamp(),
      unreadCount: increment(1),
    });
  } else {
    // Tin do mình gửi hoặc đang xem: không tăng unread
    await update(convRef, {
      partnerId,
      lastMessage,
      lastMessageAt: serverTimestamp(),
    });
  }
}

/**
 * Reset unreadCount về 0 khi mở cuộc trò chuyện.
 */
export async function markConversationAsRead(
  myUid: string,
  chatId: string,
): Promise<void> {
  const convRef = ref(database, `conversations/${myUid}/${chatId}/unreadCount`);
  await set(convRef, 0);
}

/**
 * Lắng nghe danh sách cuộc trò chuyện của người dùng (realtime).
 */
export function listenToConversations(
  uid: string,
  callback: (conversations: ConversationSummary[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const convsRef = ref(database, `conversations/${uid}`);
  return onValue(
    convsRef,
    snapshot => {
      const data = snapshot.val() as Record<
        string,
        Omit<ConversationSummary, 'chatId'>
      > | null;

      if (!data) {
        callback([]);
        return;
      }

      const conversations: ConversationSummary[] = Object.entries(data)
        .map(([chatId, conv]) => ({
          chatId,
          partnerId: conv.partnerId ?? '',
          lastMessage: conv.lastMessage ?? '',
          lastMessageAt: conv.lastMessageAt ?? 0,
          unreadCount: conv.unreadCount ?? 0,
        }))
        // Sắp xếp mới nhất lên trên
        .sort((a, b) => b.lastMessageAt - a.lastMessageAt);

      callback(conversations);
    },
    error => {
      onError?.(error);
    },
  );
}

