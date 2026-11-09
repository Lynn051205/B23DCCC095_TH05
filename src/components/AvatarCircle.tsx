/**
 * AvatarCircle.tsx
 * Hiển thị avatar chữ cái đầu hoặc ảnh đại diện.
 */
import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {colors} from '../theme';

interface AvatarCircleProps {
  name: string;
  avatar?: string;
  size?: number;
}

export function AvatarCircle({name, avatar, size = 44}: AvatarCircleProps) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      style={[
        styles.container,
        {width: size, height: size, borderRadius: size / 2},
      ]}>
      {avatar ? (
        <Image
          source={{uri: avatar}}
          style={[styles.image, {borderRadius: size / 2}]}
        />
      ) : (
        <Text style={[styles.initials, {fontSize: size * 0.36}]}>
          {initials || '?'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: colors.surface,
    fontWeight: '700',
  },
});

