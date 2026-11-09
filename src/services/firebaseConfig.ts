export const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  databaseURL: 'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_FIREBASE_APP_ID',
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  value => value.length > 0 && !value.startsWith('YOUR_'),
);
