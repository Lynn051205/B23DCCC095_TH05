/**
 * ChatHeader.tsx
 * Tiêu đề màn hình Chat: tên + trạng thái online/offline + nút quay lại.
 */
import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import {AvatarCircle} from './AvatarCircle';
import {OnlineBadge} from './OnlineBadge';
import {listenToUserPresence, type UserPresence} from '../services/presenceService';
import {colors} from '../theme';

interface ChatHeaderProps {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  onBack: () => void;
}

export function ChatHeader({
  partnerId,
  partnerName,
  partnerAvatar,
  onBack,
}: ChatHeaderProps) {
  const [presence, setPresence] = useState<UserPresence | null>(null);

  useEffect(() => {
    const unsubscribe = listenToUserPresence(partnerId, setPresence);
    return unsubscribe;
  }, [partnerId]);

  const isOnline = presence?.state === 'online';

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backBtn}
        accessibilityLabel="Quay lại">
        <View style={styles.backArrow} />
      </TouchableOpacity>

      <View style={styles.avatarContainer}>
        <AvatarCircle name={partnerName} avatar={partnerAvatar} size={38} />
        <View style={styles.badge}>
          <OnlineBadge isOnline={isOnline} size={12} />
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {partnerName}
        </Text>
        <Text style={[styles.status, isOnline ? styles.online : styles.offline]}>
          {isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  backArrow: {
    width: 10,
    height: 10,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: colors.primary,
    transform: [{rotate: '45deg'}],
  },
  avatarContainer: {position: 'relative'},
  badge: {position: 'absolute', bottom: 0, right: 0},
  info: {flex: 1, marginLeft: 10},
  name: {color: colors.text, fontSize: 16, fontWeight: '700'},
  status: {fontSize: 12, marginTop: 1},
  online: {color: colors.online},
  offline: {color: colors.muted},
});

