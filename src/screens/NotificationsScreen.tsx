/**
 * NotificationsScreen.tsx (Giai đoạn 6)
 * Màn hình Thông báo in-app.
 * Dữ liệu được lấy từ Firebase Realtime Database, không tạo thông báo giả.
 */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {
  listenToNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
  type AppNotification,
} from '../services/notificationService';
import {colors} from '../theme';
import type {MainTabScreenProps} from '../types/navigation';

type Props = MainTabScreenProps<'Notifications'>;

function formatTime(ts: number): string {
  if (!ts) {return '';}
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) {return 'Vừa xong';}
  if (diffMins < 60) {return `${diffMins} phút trước`;}
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {return `${diffHours} giờ trước`;}
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
}

function NotifItem({
  notif,
  onPress,
}: {
  notif: AppNotification;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.item, !notif.read && styles.itemUnread]}
      onPress={onPress}
      activeOpacity={0.75}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>💬</Text>
        {!notif.read && <View style={styles.dot} />}
      </View>
      <View style={styles.itemBody}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {notif.fromName || 'Người dùng'}
        </Text>
        <Text style={styles.itemMsg} numberOfLines={2}>
          {notif.message}
        </Text>
        <Text style={styles.itemTime}>{formatTime(notif.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function NotificationsScreen({navigation}: Props) {
  const {user} = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {return;}
    setLoading(true);
    const unsub = listenToNotifications(
      user.uid,
      list => {
        setNotifications(list);
        setLoading(false);
        setError(null);
      },
      err => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsub;
  }, [user]);

  async function handleMarkAll() {
    if (!user || notifications.length === 0) {return;}
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) {return;}
    try {
      await markAllNotificationsRead(user.uid, unreadIds);
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đọc.');
    }
  }

  async function handleClearAll() {
    if (!user || notifications.length === 0) {return;}
    Alert.alert('Xóa thông báo', 'Xóa tất cả thông báo?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearAllNotifications(user.uid);
          } catch {
            Alert.alert('Lỗi', 'Không thể xóa thông báo.');
          }
        },
      },
    ]);
  }

  async function handlePressNotif(notif: AppNotification) {
    if (!user) {return;}
    if (!notif.read) {
      await markNotificationRead(user.uid, notif.id).catch(() => {});
    }
    // Điều hướng đến Chat nếu có chatId
    if (notif.chatId) {
      // @ts-ignore navigating to stack screen from tab
      navigation.navigate('Chat', {
        partnerId: notif.fromUid,
        partnerName: notif.fromName || 'Người dùng',
      });
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Đang tải thông báo...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notifications.length > 0 && (
        <View style={styles.toolbar}>
          <Text style={styles.toolbarInfo}>
            {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Đã đọc tất cả'}
          </Text>
          <View style={styles.toolbarActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAll} style={styles.toolbarBtn}>
                <Text style={styles.toolbarBtnText}>Đọc tất cả</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleClearAll} style={styles.toolbarBtn}>
              <Text style={[styles.toolbarBtnText, styles.dangerText]}>Xóa tất cả</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <NotifItem notif={item} onPress={() => handlePressNotif(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
            <Text style={styles.emptySub}>
              Thông báo tin nhắn mới sẽ xuất hiện ở đây.
            </Text>
          </View>
        }
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyContainer : undefined
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {color: colors.muted, marginTop: 12, fontSize: 15},
  errorIcon: {fontSize: 36, marginBottom: 12},
  errorText: {color: colors.danger, fontSize: 15, textAlign: 'center'},
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toolbarInfo: {color: colors.muted, fontSize: 13},
  toolbarActions: {flexDirection: 'row', gap: 12},
  toolbarBtn: {paddingVertical: 4, paddingHorizontal: 6},
  toolbarBtnText: {color: colors.primary, fontSize: 13, fontWeight: '600'},
  dangerText: {color: colors.danger},
  item: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: colors.surface,
  },
  itemUnread: {backgroundColor: '#EEF4FB'},
  iconContainer: {position: 'relative', marginRight: 12},
  icon: {fontSize: 28},
  dot: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.unreadBadge,
  },
  itemBody: {flex: 1},
  itemTitle: {color: colors.text, fontSize: 15, fontWeight: '700'},
  itemMsg: {color: colors.muted, fontSize: 14, marginTop: 3, lineHeight: 19},
  itemTime: {color: colors.muted, fontSize: 12, marginTop: 4},
  separator: {height: 1, backgroundColor: colors.border},
  emptyContainer: {flexGrow: 1},
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {fontSize: 48, marginBottom: 12},
  emptyTitle: {color: colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center'},
  emptySub: {color: colors.muted, fontSize: 14, textAlign: 'center', marginTop: 8},
});
