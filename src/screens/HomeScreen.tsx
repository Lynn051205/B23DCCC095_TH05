/**
 * HomeScreen.tsx (Giai đoạn 5 - viết lại)
 * Hiển thị danh sách cuộc trò chuyện đã có, realtime.
 * Mỗi item: avatar, tên, tin nhắn cuối, thời gian, số chưa đọc.
 */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {listenToConversations, type ConversationSummary} from '../services/conversationService';
import {listenToUser, type UserProfile} from '../services/userService';
import {AvatarCircle} from '../components/AvatarCircle';
import {OnlineBadge} from '../components/OnlineBadge';
import {listenToUserPresence, type UserPresence} from '../services/presenceService';
import {colors} from '../theme';
import type {MainTabScreenProps} from '../types/navigation';

type Props = MainTabScreenProps<'Home'>;

function formatTime(timestamp: number): string {
  if (!timestamp) {return '';}
  const now = new Date();
  const date = new Date(timestamp);
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

// Item riêng để tự quản lý user + presence listeners
function ConversationItem({
  conv,
  onPress,
}: {
  conv: ConversationSummary;
  onPress: () => void;
}) {
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [presence, setPresence] = useState<UserPresence | null>(null);

  useEffect(() => {
    const unsub = listenToUser(conv.partnerId, setPartner);
    return unsub;
  }, [conv.partnerId]);

  useEffect(() => {
    const unsub = listenToUserPresence(conv.partnerId, setPresence);
    return unsub;
  }, [conv.partnerId]);

  const isOnline = presence?.state === 'online';
  const name = partner?.fullName || partner?.email || conv.partnerId;

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.avatarWrapper}>
        <AvatarCircle name={name} avatar={partner?.avatar} size={52} />
        <View style={styles.badgePosition}>
          <OnlineBadge isOnline={isOnline} size={14} />
        </View>
      </View>

      <View style={styles.itemBody}>
        <View style={styles.itemTop}>
          <Text style={styles.itemName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.itemTime}>{formatTime(conv.lastMessageAt)}</Text>
        </View>
        <View style={styles.itemBottom}>
          <Text style={styles.itemLastMsg} numberOfLines={1}>
            {conv.lastMessage || 'Chưa có tin nhắn'}
          </Text>
          {conv.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function HomeScreen({navigation}: Props) {
  const {user} = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {return;}
    setLoading(true);
    const unsub = listenToConversations(
      user.uid,
      list => {
        setConversations(list);
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

  function openChat(conv: ConversationSummary, partnerName: string) {
    // @ts-ignore navigating to a stack screen from a tab screen
    navigation.navigate('Chat', {
      partnerId: conv.partnerId,
      partnerName,
    });
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Đang tải cuộc trò chuyện...</Text>
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
      <FlatList
        data={conversations}
        keyExtractor={item => item.chatId}
        renderItem={({item}) => (
          <ConversationItem
            conv={item}
            onPress={() => {
              // lấy tên từ component item
              openChat(item, item.partnerId);
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện nào</Text>
            <Text style={styles.emptySub}>
              Vào Danh bạ để bắt đầu trò chuyện với bạn bè.
            </Text>
          </View>
        }
        contentContainerStyle={
          conversations.length === 0 ? styles.emptyContainer : undefined
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
  },
  avatarWrapper: {position: 'relative'},
  badgePosition: {position: 'absolute', bottom: 0, right: 0},
  itemBody: {flex: 1, marginLeft: 12},
  itemTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  itemName: {color: colors.text, fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8},
  itemTime: {color: colors.muted, fontSize: 12},
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  itemLastMsg: {color: colors.muted, fontSize: 14, flex: 1, marginRight: 8},
  unreadBadge: {
    backgroundColor: colors.unreadBadge,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {color: '#FFF', fontSize: 11, fontWeight: '700'},
  separator: {height: 1, backgroundColor: colors.border, marginLeft: 80},
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
