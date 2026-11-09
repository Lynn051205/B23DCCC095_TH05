import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {CompositeScreenProps} from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Chat: {partnerId: string; partnerName: string};
};

export type MainTabParamList = {
  Home: undefined;
  Contacts: undefined;
  Notifications: undefined;
  Settings: undefined;
};

/**
 * Props cho các màn hình nằm trong Tab Navigator nhưng cần navigate
 * đến Chat (một Stack screen). Dùng CompositeScreenProps để kết hợp.
 */
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;
