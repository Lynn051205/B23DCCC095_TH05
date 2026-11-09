/**
 * chatService.ts
 * Quản lý tin nhắn Chat 1-1 trong Firebase Realtime Database.
 *
 * Cấu trúc DB:
 *   chats/{chatId}/messages/{messageId}
 *     senderId, receiverId, type, content, latitude, longitude, timestamp
 */
import {
  ref,
  push,
  onChildAdded,
  serverTimestamp,
  Unsubscribe,
  query,
  orderByChild,
  limitToLast,
} from 'firebase/database';
import {database} from './firebase';

export type MessageType = 'text' | 'location';

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  type: MessageType;
  content?: string;
  latitude?: number;
  longitude?: number;
  timestamp: number;
}

/**
 * Tạo chatId thống nhất từ hai uid (sắp xếp theo thứ tự từ điển).
 * Đảm bảo cả hai phía đều dùng chung một phòng chat.
 */
export function buildChatId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

/**
 * Gửi tin nhắn văn bản.
 */
export async function sendTextMessage(
  chatId: string,
  senderId: string,
  receiverId: string,
  content: string,
): Promise<void> {
  if (!content.trim()) {
    throw new Error('Tin nhắn không được để trống.');
  }
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  await push(messagesRef, {
    senderId,
    receiverId,
    type: 'text',
    content: content.trim(),
    timestamp: serverTimestamp(),
  });
}

/**
 * Gửi tin nhắn vị trí.
 */
export async function sendLocationMessage(
  chatId: string,
  senderId: string,
  receiverId: string,
  latitude: number,
  longitude: number,
): Promise<void> {
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  await push(messagesRef, {
    senderId,
    receiverId,
    type: 'location',
    latitude,
    longitude,
    timestamp: serverTimestamp(),
  });
}

/**
 * Lắng nghe tin nhắn mới realtime bằng onChildAdded.
 * Chỉ lấy 100 tin nhắn gần nhất để tránh tải quá nhiều dữ liệu.
 * Trả về unsubscribe để cleanup khi rời màn hình.
 */
export function listenToMessages(
  chatId: string,
  callback: (message: ChatMessage) => void,
): Unsubscribe {
  const messagesRef = query(
    ref(database, `chats/${chatId}/messages`),
    orderByChild('timestamp'),
    limitToLast(100),
  );

  return onChildAdded(messagesRef, snapshot => {
    if (!snapshot.exists()) {return;}
    const data = snapshot.val() as Omit<ChatMessage, 'id'>;
    callback({
      id: snapshot.key!,
      senderId: data.senderId,
      receiverId: data.receiverId,
      type: data.type ?? 'text',
      content: data.content,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: data.timestamp ?? Date.now(),
    });
  });
}

