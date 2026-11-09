import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text} from 'react-native';
import {colors} from '../theme';

type PrimaryButtonProps = {
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onPress: () => void;
};

export function PrimaryButton({
  disabled = false,
  label,
  loading = false,
  onPress,
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={colors.surface} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 18,
  },
  disabled: {opacity: 0.6},
  label: {color: colors.surface, fontSize: 16, fontWeight: '700'},
  pressed: {opacity: 0.85},
});
