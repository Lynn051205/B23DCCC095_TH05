/**
 * MessageBubble.tsx
 * Hiển thị một tin nhắn trong màn hình Chat.
 * Hỗ trợ type: 'text' | 'location'
 */
import React from 'react';
import {View, Text, StyleSheet, Linking, TouchableOpacity} from 'react-native';
import {colors} from '../theme';
import type {ChatMessage} from '../services/chatService';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

function formatTime(timestamp: number): string {
  if (!timestamp) {return '';}
  const date = new Date(timestamp);
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function MessageBubble({message, isOwn}: MessageBubbleProps) {
  const isLocation = message.type === 'location';

  function openMap() {
    if (message.latitude != null && message.longitude != null) {
      const url = `https://www.google.com/maps/search/?api=1&query=${message.latitude},${message.longitude}`;
      Linking.openURL(url).catch(() => {});
    }
  }

  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      <View
        style={[
          styles.bubble,
          isOwn ? styles.bubbleOwn : styles.bubbleOther,
        ]}>
        {isLocation ? (
          <TouchableOpacity onPress={openMap} activeOpacity={0.75}>
            <Text style={[styles.locationIcon]}>📍</Text>
            <Text
              style={[
                styles.locationText,
                isOwn ? styles.textOwn : styles.textOther,
              ]}>
              Vị trí:{'\n'}
              {message.latitude?.toFixed(6)}, {message.longitude?.toFixed(6)}
            </Text>
            <Text
              style={[
                styles.openMap,
                isOwn ? styles.openMapOwn : styles.openMapOther,
              ]}>
              Mở bản đồ ↗
            </Text>
          </TouchableOpacity>
        ) : (
          <Text
            style={[
              styles.content,
              isOwn ? styles.textOwn : styles.textOther,
            ]}>
            {message.content}
          </Text>
        )}
        <Text
          style={[styles.time, isOwn ? styles.timeOwn : styles.timeOther]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 3,
    paddingHorizontal: 12,
  },
  rowOwn: {justifyContent: 'flex-end'},
  rowOther: {justifyContent: 'flex-start'},
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleOwn: {
    backgroundColor: colors.sentBubble,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.receivedBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {fontSize: 15, lineHeight: 21},
  textOwn: {color: colors.sentText},
  textOther: {color: colors.receivedText},
  time: {fontSize: 11, marginTop: 4, alignSelf: 'flex-end'},
  timeOwn: {color: 'rgba(255,255,255,0.7)'},
  timeOther: {color: colors.muted},
  locationIcon: {fontSize: 22, textAlign: 'center', marginBottom: 2},
  locationText: {fontSize: 13, lineHeight: 18},
  openMap: {fontSize: 12, marginTop: 4, fontWeight: '600'},
  openMapOwn: {color: 'rgba(255,255,255,0.85)'},
  openMapOther: {color: colors.primary},
});

