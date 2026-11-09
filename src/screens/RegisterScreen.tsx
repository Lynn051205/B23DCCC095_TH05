import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {FormField} from '../components/FormField';
import {PrimaryButton} from '../components/PrimaryButton';
import {getAuthErrorMessage, registerWithEmail} from '../services/authService';
import {colors} from '../theme';

export function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister() {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ các trường.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Email không hợp lệ', 'Vui lòng kiểm tra lại địa chỉ email.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Mật khẩu quá ngắn', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mật khẩu không khớp', 'Hai mật khẩu nhập vào chưa giống nhau.');
      return;
    }

    setSubmitting(true);
    try {
      await registerWithEmail(fullName, email, password);
      Alert.alert('Thành công', 'Tài khoản đã được tạo.');
    } catch (error) {
      Alert.alert('Đăng ký thất bại', getAuthErrorMessage(error));
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
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>
            Đăng ký để kết nối và trò chuyện realtime
          </Text>
          <FormField
            autoCapitalize="words"
            label="Họ tên"
            onChangeText={setFullName}
            placeholder="Nguyễn Văn A"
            value={fullName}
          />
          <FormField
            label="Email"
            onChangeText={setEmail}
            placeholder="name@example.com"
            value={email}
          />
          <FormField
            label="Mật khẩu"
            onChangeText={setPassword}
            placeholder="Tối thiểu 6 ký tự"
            secureTextEntry
            value={password}
          />
          <FormField
            label="Nhập lại mật khẩu"
            onChangeText={setConfirmPassword}
            placeholder="Nhập lại mật khẩu"
            secureTextEntry
            value={confirmPassword}
          />
          <PrimaryButton
            label="Đăng ký"
            loading={submitting}
            onPress={handleRegister}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  content: {flexGrow: 1, justifyContent: 'center', padding: 24},
  card: {backgroundColor: colors.surface, borderRadius: 20, padding: 22},
  title: {color: colors.primary, fontSize: 26, fontWeight: '800'},
  subtitle: {color: colors.muted, fontSize: 14, marginBottom: 24, marginTop: 8},
});
