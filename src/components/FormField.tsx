import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {colors} from '../theme';

type FormFieldProps = {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
};

export function FormField({
  autoCapitalize = 'none',
  label,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  value,
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {marginBottom: 16},
  label: {color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 7},
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 14,
  },
});
