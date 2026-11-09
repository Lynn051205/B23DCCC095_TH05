/**
 * presenceService.ts
 * Quản lý trạng thái Online/Offline của người dùng bằng Firebase Realtime Database.
 * Sử dụng .info/connected, onDisconnect(), onValue(), set().
 */
import {ref, onValue, set, onDisconnect, serverTimestamp, Unsubscribe} from 'firebase/database';
import {database} from './firebase';

export type PresenceStatus = 'online' | 'offline';

export interface UserPresence {
  state: PresenceStatus;
  lastChanged: number | object;
}

/**
 * Bắt đầu theo dõi kết nối và cập nhật trạng thái Online/Offline.
 * Trả về hàm cleanup để hủy listener khi không còn sử dụng.
 */
export function startPresenceTracking(uid: string): Unsubscribe {
  const userStatusRef = ref(database, `status/${uid}`);
  const connectedRef = ref(database, '.info/connected');

  const unsubscribe = onValue(connectedRef, snapshot => {
    if (snapshot.val() === false) {
      // Không làm gì khi mất kết nối tạm thời; onDisconnect() sẽ xử lý
      return;
    }

    // Khi kết nối lại: đăng ký onDisconnect để ghi offline tự động
    onDisconnect(userStatusRef)
      .set({
        state: 'offline',
        lastChanged: serverTimestamp(),
      })
      .then(() => {
        // Sau khi đã đăng ký onDisconnect, ghi trạng thái online
        set(userStatusRef, {
          state: 'online',
          lastChanged: serverTimestamp(),
        });
      })
      .catch(() => {
        // Nếu không ghi được, bỏ qua để không crash app
      });
  });

  return unsubscribe;
}

/**
 * Lắng nghe trạng thái của một người dùng cụ thể (realtime).
 */
export function listenToUserPresence(
  uid: string,
  callback: (presence: UserPresence | null) => void,
): Unsubscribe {
  const statusRef = ref(database, `status/${uid}`);
  return onValue(statusRef, snapshot => {
    callback(snapshot.val() as UserPresence | null);
  });
}

/**
 * Cập nhật trạng thái offline thủ công (khi đăng xuất).
 */
export async function setOffline(uid: string): Promise<void> {
  const userStatusRef = ref(database, `status/${uid}`);
  await set(userStatusRef, {
    state: 'offline',
    lastChanged: serverTimestamp(),
  });
}

