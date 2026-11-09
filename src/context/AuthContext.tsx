import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import {onAuthStateChanged, type User} from 'firebase/auth';
import {auth, isFirebaseConfigured} from '../services/firebase';
import {startPresenceTracking} from '../services/presenceService';

type AuthContextValue = {
  error: string | null;
  loading: boolean;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({children}: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }

    return onAuthStateChanged(
      auth,
      currentUser => {
        setUser(currentUser);
        setLoading(false);
        setError(null);
      },
      authError => {
        setError(authError.message);
        setLoading(false);
      },
    );
  }, []);

  // Bắt đầu tracking presence khi user đăng nhập
  useEffect(() => {
    if (!user) {return;}
    const stopTracking = startPresenceTracking(user.uid);
    return stopTracking;
  }, [user]);

  const value = useMemo(
    () => ({error, loading, user}),
    [error, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider.');
  }
  return context;
}
