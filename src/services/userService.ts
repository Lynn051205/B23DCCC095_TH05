/**
 * userService.ts
 * Truy vấn danh sách người dùng từ Firebase Realtime Database.
 */
import {ref, onValue, Unsubscribe} from 'firebase/database';
import {database} from './firebase';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  avatar: string;
}

/**
 * Lắng nghe danh sách tất cả người dùng (realtime).
 * Loại bỏ người dùng hiện tại khỏi kết quả.
 */
export function listenToUsers(
  currentUid: string,
  callback: (users: UserProfile[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const usersRef = ref(database, 'users');
  return onValue(
    usersRef,
    snapshot => {
      const data = snapshot.val() as Record<string, Omit<UserProfile, 'uid'>> | null;
      if (!data) {
        callback([]);
        return;
      }
      const users: UserProfile[] = Object.entries(data)
        .filter(([uid]) => uid !== currentUid)
        .map(([uid, profile]) => ({
          uid,
          fullName: profile.fullName ?? '',
          email: profile.email ?? '',
          avatar: profile.avatar ?? '',
        }));
      callback(users);
    },
    error => {
      onError?.(error);
    },
  );
}

/**
 * Lấy thông tin một người dùng theo uid (one-time).
 */
export function listenToUser(
  uid: string,
  callback: (user: UserProfile | null) => void,
): Unsubscribe {
  const userRef = ref(database, `users/${uid}`);
  return onValue(userRef, snapshot => {
    const data = snapshot.val() as Omit<UserProfile, 'uid'> | null;
    if (!data) {
      callback(null);
      return;
    }
    callback({uid, ...data});
  });
}

