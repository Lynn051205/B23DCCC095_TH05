/**
 * OnlineBadge.tsx
 * Hiển thị chấm tròn Online (xanh) hoặc Offline (xám).
 */
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors} from '../theme';

interface OnlineBadgeProps {
  isOnline: boolean;
  size?: number;
}

export function OnlineBadge({isOnline, size = 12}: OnlineBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isOnline ? colors.online : colors.offline,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 2,
    borderColor: colors.surface,
  },
});

