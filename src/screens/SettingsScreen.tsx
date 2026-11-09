/**
 * SettingsScreen.tsx (Giai đoạn 7)
 * Giữ chức năng Đăng xuất. Gọi setOffline trước khi signOut.
 */
import React, {useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {PrimaryButton} from '../components/PrimaryButton';
import {logout} from '../services/authService';
import {useAuth} from '../context/AuthContext';
import {colors} from '../theme';

export function SettingsScreen() {
  const {user} = useAuth();
  const [submitting, setSubmitting] = useState(false);

  function confirmLogout() {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất khỏi tài khoản?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          performLogout();
        },
      },
    ]);
  }

  async function performLogout() {
    setSubmitting(true);
    try {
      await logout(user?.uid);
    } catch (error) {
      Alert.alert(
        'Đăng xuất thất bại',
        error instanceof Error ? error.message : 'Vui lòng thử lại.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      {user && (
        <View style={styles.infoCard}>
          <Text style={styles.label}>Tài khoản</Text>
          <Text style={styles.name}>{user.displayName || '(Chưa đặt tên)'}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      )}
      <Text style={styles.description}>
        Đăng xuất tài khoản Firebase khỏi thiết bị này.
      </Text>
      <PrimaryButton
        label="Đăng xuất"
        loading={submitting}
        onPress={confirmLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 24, backgroundColor: colors.background},
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {color: colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 4},
  name: {color: colors.text, fontSize: 18, fontWeight: '700'},
  email: {color: colors.muted, fontSize: 14, marginTop: 4},
  description: {color: colors.muted, fontSize: 15, marginBottom: 20},
});
