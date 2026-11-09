import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FormField} from '../components/FormField';
import {PrimaryButton} from '../components/PrimaryButton';
import {getAuthErrorMessage, loginWithEmail} from '../services/authService';
import {colors} from '../theme';
import type {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({navigation}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
      return;
    }

    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
    } catch (error) {
      Alert.alert('Đăng nhập thất bại', getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Xin chào 👋</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục trò chuyện</Text>
          <FormField
            label="Email"
            onChangeText={setEmail}
            placeholder="name@example.com"
            value={email}
          />
          <FormField
            label="Mật khẩu"
            onChangeText={setPassword}
            placeholder="Nhập mật khẩu"
            secureTextEntry
            value={password}
          />
          <PrimaryButton
            label="Đăng nhập"
            loading={submitting}
            onPress={handleLogin}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Register')}
            style={styles.linkButton}>
            <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  content: {flexGrow: 1, justifyContent: 'center', padding: 24},
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 22,
  },
  title: {color: colors.primary, fontSize: 28, fontWeight: '800'},
  subtitle: {color: colors.muted, fontSize: 15, marginBottom: 26, marginTop: 8},
  linkButton: {alignItems: 'center', paddingTop: 20},
  linkText: {color: colors.primary, fontSize: 14, fontWeight: '600'},
});
