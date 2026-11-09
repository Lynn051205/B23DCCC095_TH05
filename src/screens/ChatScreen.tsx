/**
 * ChatScreen.tsx
 * Giai đoạn 3 + 4: Chat 1-1 Realtime + Gửi vị trí
 *
 * - Lắng nghe tin nhắn realtime bằng onChildAdded (cleanup khi unmount)
 * - Gửi văn bản và vị trí GPS
 * - Cập nhật conversation summary và tạo thông báo
 * - Không để tin nhắn trùng lặp khi đăng ký listener lại
 * - Tự cuộn xuống tin mới nhất
 * - Hỗ trợ bàn phím Android/iOS
 */
import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  ActivityIndicator,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAuth} from '../context/AuthContext';
import {
  buildChatId,
  listenToMessages,
  sendTextMessage,
  sendLocationMessage,
  type ChatMessage,
} from '../services/chatService';
import {updateConversationSummary, markConversationAsRead} from '../services/conversationService';
import {createMessageNotification} from '../services/notificationService';
import {getCurrentLocation} from '../services/locationService';
import {listenToUser} from '../services/userService';
import {ChatHeader} from '../components/ChatHeader';
import {MessageBubble} from '../components/MessageBubble';
import {ChatInput} from '../components/ChatInput';
import {colors} from '../theme';
import type {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export function ChatScreen({route, navigation}: Props) {
  const {partnerId, partnerName} = route.params;
  const {user} = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendingLocation, setSendingLocation] = useState(false);
  const [partnerAvatar, setPartnerAvatar] = useState<string>('');

  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  // Tập hợp id đã nhận để tránh trùng lặp
  const receivedIds = useRef<Set<string>>(new Set());
  // Ref để biết màn hình đang được mở hay không
  const isActiveRef = useRef(true);

  const chatId = user ? buildChatId(user.uid, partnerId) : '';

  // Lấy avatar của đối phương
  useEffect(() => {
    if (!partnerId) {return;}
    const unsub = listenToUser(partnerId, profile => {
      setPartnerAvatar(profile?.avatar ?? '');
    });
    return unsub;
  }, [partnerId]);

  // Đánh dấu đã đọc khi mở chat
  useEffect(() => {
    if (!user || !chatId) {return;}
    markConversationAsRead(user.uid, chatId).catch(() => {});
    return () => {
      // Khi rời màn hình, đánh dấu isActive = false
      isActiveRef.current = false;
    };
  }, [user, chatId]);

  // Lắng nghe tin nhắn realtime
  useEffect(() => {
    if (!chatId || !user) {return;}
    isActiveRef.current = true;
    setLoading(true);

    // Reset khi vào lại màn hình để không trùng
    setMessages([]);
    receivedIds.current.clear();

    const unsub = listenToMessages(chatId, (msg: ChatMessage) => {
      // Bỏ qua nếu đã nhận
      if (receivedIds.current.has(msg.id)) {return;}
      receivedIds.current.add(msg.id);

      setMessages(prev => {
        // Thêm vào cuối (onChildAdded cho từng tin một)
        const updated = [...prev, msg].sort((a, b) => a.timestamp - b.timestamp);
        return updated;
      });
      setLoading(false);

      // Nếu tin đến từ đối phương và màn hình đang mở → không tăng unread
      // Chỉ cần cập nhật summary cho phía mình
      if (msg.senderId !== user.uid && isActiveRef.current) {
        markConversationAsRead(user.uid, chatId).catch(() => {});
      }
    });

    // Sau 1.5s nếu chưa có tin nào thì tắt loading
    const timeout = setTimeout(() => setLoading(false), 1500);

    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, [chatId, user]);

  // Cuộn xuống tin mới nhất
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [messages.length]);

  const handleSendText = useCallback(
    async (text: string) => {
      if (!user || !chatId) {return;}
      setSending(true);
      try {
        await sendTextMessage(chatId, user.uid, partnerId, text);

        const preview = text.length > 60 ? text.slice(0, 57) + '...' : text;

        // Cập nhật conversation summary cho cả hai phía
        await Promise.all([
          updateConversationSummary(user.uid, chatId, partnerId, preview, false),
          updateConversationSummary(partnerId, chatId, user.uid, preview, true),
        ]);

        // Tạo thông báo cho đối phương
        await createMessageNotification(
          partnerId,
          user.uid,
          user.displayName || user.email || 'Người dùng',
          chatId,
          preview,
        );
      } catch (err) {
        Alert.alert(
          'Gửi thất bại',
          err instanceof Error ? err.message : 'Không thể gửi tin nhắn.',
        );
      } finally {
        setSending(false);
      }
    },
    [user, chatId, partnerId],
  );

  const handleSendLocation = useCallback(async () => {
    if (!user || !chatId) {return;}
    setSendingLocation(true);
    try {
      const coords = await getCurrentLocation();
      await sendLocationMessage(
        chatId,
        user.uid,
        partnerId,
        coords.latitude,
        coords.longitude,
      );

      const preview = `📍 Vị trí: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
      await Promise.all([
        updateConversationSummary(user.uid, chatId, partnerId, preview, false),
        updateConversationSummary(partnerId, chatId, user.uid, preview, true),
      ]);

      await createMessageNotification(
        partnerId,
        user.uid,
        user.displayName || user.email || 'Người dùng',
        chatId,
        preview,
      );
    } catch (err) {
      Alert.alert(
        'Không thể gửi vị trí',
        err instanceof Error ? err.message : 'Lỗi không xác định.',
      );
    } finally {
      setSendingLocation(false);
    }
  }, [user, chatId, partnerId]);

  if (!user) {return null;}

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <ChatHeader
        partnerId={partnerId}
        partnerName={partnerName}
        partnerAvatar={partnerAvatar}
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <MessageBubble message={item} isOwn={item.senderId === user.uid} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>
                Hãy gửi tin nhắn đầu tiên!
              </Text>
            </View>
          }
          contentContainerStyle={
            messages.length === 0 ? styles.emptyContent : styles.listContent
          }
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({animated: false});
            }
          }}
        />
      )}

      <ChatInput
        onSendText={handleSendText}
        onSendLocation={handleSendLocation}
        sending={sending}
        sendingLocation={sendingLocation}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.background},
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {color: colors.muted, marginTop: 10},
  listContent: {paddingVertical: 10},
  emptyContent: {flexGrow: 1},
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {fontSize: 48, marginBottom: 12},
  emptyText: {color: colors.muted, fontSize: 15, textAlign: 'center'},
});

