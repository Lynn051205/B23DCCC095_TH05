/**
 * App.tsx (Giai đoạn 7 - Navigation hoàn chỉnh)
 *
 * Cấu trúc Navigation:
 *   Stack Navigator (Root)
 *   ├── [Chưa đăng nhập]
 *   │   ├── Login
 *   │   └── Register
 *   └── [Đã đăng nhập]
 *       ├── Main (Bottom Tab Navigator)
 *       │   ├── Home (tab)
 *       │   ├── Contacts (tab)
 *       │   ├── Notifications (tab)
 *       │   └── Settings (tab)
 *       └── Chat (full-screen stack, không có tab bar)
 */
import React from 'react';
import {ActivityIndicator, StatusBar, StyleSheet, Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import {isFirebaseConfigured} from './src/services/firebase';
import {LoginScreen} from './src/screens/LoginScreen';
import {RegisterScreen} from './src/screens/RegisterScreen';
import {HomeScreen} from './src/screens/HomeScreen';
import {ContactsScreen} from './src/screens/ContactsScreen';
import {ChatScreen} from './src/screens/ChatScreen';
import {NotificationsScreen} from './src/screens/NotificationsScreen';
import {SettingsScreen} from './src/screens/SettingsScreen';
import {colors} from './src/theme';
import type {RootStackParamList, MainTabParamList} from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Các icon tab đơn giản bằng emoji/text
function TabIcon({emoji, focused}: {emoji: string; focused: boolean}) {
  return (
    <Text style={{fontSize: 22, opacity: focused ? 1 : 0.5}}>{emoji}</Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.surface},
        headerTintColor: colors.primary,
        headerTitleStyle: {fontWeight: '700'},
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Tin nhắn',
          tabBarLabel: 'Tin nhắn',
          tabBarIcon: ({focused}) => <TabIcon emoji="💬" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          title: 'Danh bạ',
          tabBarLabel: 'Danh bạ',
          tabBarIcon: ({focused}) => <TabIcon emoji="👥" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Thông báo',
          tabBarLabel: 'Thông báo',
          tabBarIcon: ({focused}) => <TabIcon emoji="🔔" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Cài đặt',
          tabBarLabel: 'Cài đặt',
          tabBarIcon: ({focused}) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const {loading, error, user} = useAuth();

  if (!isFirebaseConfigured) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Cần cấu hình Firebase</Text>
        <Text style={styles.description}>
          Điền thông tin Firebase trong src/services/firebaseConfig.ts, bật
          Email/Password Authentication và Realtime Database, sau đó chạy lại
          ứng dụng.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.description}>Đang kiểm tra đăng nhập...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Không thể khởi tạo đăng nhập</Text>
        <Text style={styles.description}>{error}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: {color: colors.primary, fontWeight: '700'},
          contentStyle: {backgroundColor: colors.background},
        }}>
        {user ? (
          <>
            {/* Main: ẩn header của Stack vì Tab đã có header riêng */}
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{headerShown: false}}
            />
            {/* Chat: màn hình đầy đủ, không có tab bar, header tuỳ chỉnh */}
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{headerShown: false}}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              component={LoginScreen}
              name="Login"
              options={{headerShown: false}}
            />
            <Stack.Screen
              component={RegisterScreen}
              name="Register"
              options={{title: 'Tạo tài khoản'}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default App;
