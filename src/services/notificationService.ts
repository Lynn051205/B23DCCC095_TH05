/**
 * notificationService.ts
 * Quản lý thông báo trong ứng dụng (in-app notifications).
 * Dữ liệu được lấy từ Firebase Realtime Database, không tạo thông báo giả.
 *
 * Cấu trúc DB:
 *   notifications/{uid}/{notifId}
 *     type, fromUid, fromName, message, chatId, read, createdAt
 */
import {
  ref,
  onValue,
  update,
  set,
  Unsubscribe,
  serverTimestamp,
  push,
} from 'firebase/database';
import {database} from './firebase';

export type NotificationType = 'new_message';

export interface AppNotification {
  id: string;
  type: NotificationType;
  fromUid: string;
  fromName: string;
  message: string;
  chatId: string;
  read: boolean;
  createdAt: number;
}

/**
 * Tạo thông báo tin nhắn mới cho người nhận.
 * Được gọi từ chatService sau khi gửi tin nhắn thành công.
 */
export async function createMessageNotification(
  receiverUid: string,
  fromUid: string,
  fromName: string,
  chatId: string,
  messagePreview: string,
): Promise<void> {
  const notifRef = ref(database, `notifications/${receiverUid}`);
  await push(notifRef, {
    type: 'new_message',
    fromUid,
    fromName,
    message: messagePreview.length > 60 ? messagePreview.slice(0, 57) + '...' : messagePreview,
    chatId,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * Lắng nghe danh sách thông báo của người dùng (realtime).
 */
export function listenToNotifications(
  uid: string,
  callback: (notifications: AppNotification[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const notifRef = ref(database, `notifications/${uid}`);
  return onValue(
    notifRef,
    snapshot => {
      const data = snapshot.val() as Record<
        string,
        Omit<AppNotification, 'id'>
      > | null;

      if (!data) {
        callback([]);
        return;
      }

      const notifications: AppNotification[] = Object.entries(data)
        .map(([id, notif]) => ({
          id,
          type: notif.type ?? 'new_message',
          fromUid: notif.fromUid ?? '',
          fromName: notif.fromName ?? '',
          message: notif.message ?? '',
          chatId: notif.chatId ?? '',
          read: notif.read ?? false,
          createdAt: notif.createdAt ?? 0,
        }))
        .sort((a, b) => b.createdAt - a.createdAt);

      callback(notifications);
    },
    error => {
      onError?.(error);
    },
  );
}

/**
 * Đánh dấu một thông báo đã đọc.
 */
export async function markNotificationRead(
  uid: string,
  notifId: string,
): Promise<void> {
  await update(ref(database, `notifications/${uid}/${notifId}`), {read: true});
}

/**
 * Đánh dấu tất cả thông báo đã đọc.
 */
export async function markAllNotificationsRead(
  uid: string,
  notifIds: string[],
): Promise<void> {
  const updates: Record<string, boolean> = {};
  for (const id of notifIds) {
    updates[`notifications/${uid}/${id}/read`] = true;
  }
  await update(ref(database, '/'), updates);
}

/**
 * Xóa tất cả thông báo của người dùng.
 */
export async function clearAllNotifications(uid: string): Promise<void> {
  await set(ref(database, `notifications/${uid}`), null);
}

