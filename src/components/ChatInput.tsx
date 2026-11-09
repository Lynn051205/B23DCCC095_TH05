/**
 * ChatInput.tsx
 * Thanh nhập tin nhắn phía dưới màn hình Chat.
 * Có nút gửi tin nhắn và nút gửi vị trí.
 */
import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {colors} from '../theme';

interface ChatInputProps {
  onSendText: (text: string) => Promise<void>;
  onSendLocation: () => Promise<void>;
  sending?: boolean;
  sendingLocation?: boolean;
}

export function ChatInput({
  onSendText,
  onSendLocation,
  sending = false,
  sendingLocation = false,
}: ChatInputProps) {
  const [text, setText] = useState('');

  async function handleSend() {
    if (!text.trim()) {return;}
    const toSend = text;
    setText('');
    await onSendText(toSend);
  }

  const canSend = text.trim().length > 0 && !sending;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onSendLocation}
        disabled={sendingLocation || sending}
        style={[styles.iconBtn, sendingLocation && styles.iconBtnDisabled]}
        accessibilityLabel="Gửi vị trí">
        {sendingLocation ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          // Simple location pin using text
          <View style={styles.locationIcon}>
            <View style={styles.pinTop} />
            <View style={styles.pinBottom} />
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Nhập tin nhắn..."
        placeholderTextColor={colors.muted}
        multiline
        maxLength={1000}
        returnKeyType={Platform.OS === 'ios' ? 'default' : 'send'}
        onSubmitEditing={Platform.OS === 'android' ? handleSend : undefined}
      />

      <TouchableOpacity
        onPress={handleSend}
        disabled={!canSend}
        style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
        accessibilityLabel="Gửi tin nhắn">
        {sending ? (
          <ActivityIndicator size="small" color={colors.surface} />
        ) : (
          <View style={styles.sendArrow} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  iconBtnDisabled: {opacity: 0.5},
  locationIcon: {alignItems: 'center'},
  pinTop: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
  },
  pinBottom: {
    width: 2,
    height: 6,
    backgroundColor: colors.primary,
    marginTop: 1,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    color: colors.text,
    maxHeight: 120,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  sendBtnDisabled: {backgroundColor: colors.border},
  sendArrow: {
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: colors.surface,
    marginLeft: 3,
  },
});

