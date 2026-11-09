/**
 * ContactsScreen.tsx
 * Giai đoạn 2: Màn hình Danh bạ
 * - Lấy danh sách người dùng từ Firebase Realtime Database
 * - Hiển thị trạng thái Online/Offline realtime
 * - Tìm kiếm theo tên hoặc email
 * - Nhấn vào người dùng → mở Chat 1-1
 */
import React, {useEffect, useState, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {listenToUsers, type UserProfile} from '../services/userService';
import {listenToUserPresence, type UserPresence} from '../services/presenceService';
import {AvatarCircle} from '../components/AvatarCircle';
import {OnlineBadge} from '../components/OnlineBadge';
import {colors} from '../theme';
import type {MainTabScreenProps} from '../types/navigation';

type Props = MainTabScreenProps<'Contacts'>;

// Item riêng để tự quản lý presence listener
function ContactItem({
  user,
  onPress,
}: {
  user: UserProfile;
  onPress: () => void;
}) {
  const [presence, setPresence] = useState<UserPresence | null>(null);

  useEffect(() => {
    const unsub = listenToUserPresence(user.uid, setPresence);
    return unsub;
  }, [user.uid]);

  const isOnline = presence?.state === 'online';

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.avatarWrapper}>
        <AvatarCircle name={user.fullName || user.email} avatar={user.avatar} size={48} />
        <View style={styles.badgePosition}>
          <OnlineBadge isOnline={isOnline} size={14} />
        </View>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {user.fullName || '(Chưa đặt tên)'}
        </Text>
        <Text style={styles.itemEmail} numberOfLines={1}>
          {user.email}
        </Text>
        <Text style={[styles.statusText, isOnline ? styles.online : styles.offline]}>
          {isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function ContactsScreen({navigation}: Props) {
  const {user} = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) {return;}
    setLoading(true);
    const unsub = listenToUsers(
      user.uid,
      list => {
        setUsers(list);
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {return users;}
    return users.filter(
      u =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  function openChat(contact: UserProfile) {
    // @ts-ignore navigating to a stack screen from a tab screen
    navigation.navigate('Chat', {
      partnerId: contact.uid,
      partnerName: contact.fullName || contact.email,
    });
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Đang tải danh bạ...</Text>
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
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm theo tên hoặc email..."
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.uid}
        renderItem={({item}) => (
          <ContactItem user={item} onPress={() => openChat(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>{search ? '🔍' : '👥'}</Text>
            <Text style={styles.emptyTitle}>
              {search ? 'Không tìm thấy kết quả' : 'Chưa có người dùng nào'}
            </Text>
            <Text style={styles.emptySub}>
              {search
                ? `Không có người dùng nào khớp với "${search}"`
                : 'Những người dùng đăng ký sẽ xuất hiện ở đây.'}
            </Text>
          </View>
        }
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : undefined}
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
  searchContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    color: colors.text,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.surface,
  },
  avatarWrapper: {position: 'relative'},
  badgePosition: {position: 'absolute', bottom: 0, right: 0},
  itemInfo: {flex: 1, marginLeft: 12},
  itemName: {color: colors.text, fontSize: 16, fontWeight: '600'},
  itemEmail: {color: colors.muted, fontSize: 13, marginTop: 2},
  statusText: {fontSize: 12, marginTop: 3, fontWeight: '500'},
  online: {color: colors.online},
  offline: {color: colors.muted},
  separator: {height: 1, backgroundColor: colors.border, marginLeft: 76},
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
