import AsyncStorage from '@react-native-async-storage/async-storage';
import {getApp, getApps, initializeApp} from 'firebase/app';
import {
  getAuth,
  initializeAuth,
} from 'firebase/auth';
// The React Native Firebase auth entry exports this but the SDK's shared types do not.
// @ts-expect-error React Native-specific export from Firebase Auth.
import {getReactNativePersistence} from 'firebase/auth';
import {getDatabase} from 'firebase/database';
import {firebaseConfig, isFirebaseConfigured} from './firebaseConfig';

const existingApps = getApps();
const app = existingApps.length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth =
  existingApps.length > 0
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

export const database = getDatabase(app);
export {isFirebaseConfigured};
