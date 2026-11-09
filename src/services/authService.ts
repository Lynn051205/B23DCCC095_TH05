import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {ref, serverTimestamp, set} from 'firebase/database';
import {auth, database} from './firebase';
import {setOffline} from './presenceService';

export async function registerWithEmail(
  fullName: string,
  email: string,
  password: string,
): Promise<void> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );

  try {
    await updateProfile(credential.user, {displayName: fullName.trim()});
    await set(ref(database, `users/${credential.user.uid}`), {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      avatar: '',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(
      `Tài khoản đã được tạo nhưng chưa lưu được hồ sơ lên Realtime Database: ${errorMessage(error)}`,
    );
  }
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );
  return credential.user;
}

export async function logout(uid?: string): Promise<void> {
  // Ghi trạng thái offline trước khi đăng xuất
  if (uid) {
    try {
      await setOffline(uid);
    } catch {
      // Không để lỗi presence cản trở đăng xuất
    }
  }
  await signOut(auth);
}

export function getAuthErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Email này đã được đăng ký.';
      case 'auth/invalid-email':
        return 'Địa chỉ email không hợp lệ.';
      case 'auth/weak-password':
        return 'Mật khẩu phải có ít nhất 6 ký tự.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Email hoặc mật khẩu không chính xác.';
      case 'auth/network-request-failed':
        return 'Không thể kết nối. Hãy kiểm tra mạng và thử lại.';
      case 'PERMISSION_DENIED':
        return 'Firebase từ chối thao tác. Hãy kiểm tra Authentication và luật Realtime Database.';
    }
  }

  return errorMessage(error);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Lỗi không xác định.';
}
