/**
 * locationService.ts
 * Lấy vị trí GPS của người dùng bằng @react-native-community/geolocation.
 * Xử lý quyền truy cập, lỗi GPS và không để app crash.
 */
import Geolocation from '@react-native-community/geolocation';
import {PermissionsAndroid, Platform} from 'react-native';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Xin quyền truy cập vị trí trên Android.
 * iOS tự động yêu cầu khi gọi getCurrentPosition.
 * Trả về true nếu được cấp quyền.
 */
async function requestLocationPermissionAndroid(): Promise<boolean> {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Quyền truy cập vị trí',
        message: 'Ứng dụng cần quyền truy cập vị trí để gửi vị trí trong chat.',
        buttonPositive: 'Cho phép',
        buttonNegative: 'Từ chối',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

/**
 * Lấy tọa độ hiện tại.
 * Trả về GeoCoordinates hoặc throw Error có thể hiển thị cho người dùng.
 */
export async function getCurrentLocation(): Promise<GeoCoordinates> {
  // Xin quyền Android
  if (Platform.OS === 'android') {
    const granted = await requestLocationPermissionAndroid();
    if (!granted) {
      throw new Error(
        'Bạn đã từ chối quyền truy cập vị trí. Hãy cấp quyền trong Cài đặt ứng dụng để gửi vị trí.',
      );
    }
  }

  return new Promise<GeoCoordinates>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        let message = 'Không thể lấy được vị trí.';
        switch (error.code) {
          case 1:
            message =
              'Bạn đã từ chối quyền truy cập vị trí. Hãy cấp quyền trong Cài đặt.';
            break;
          case 2:
            message =
              'Không thể xác định vị trí. Hãy bật GPS và thử lại.';
            break;
          case 3:
            message =
              'Hết thời gian chờ lấy vị trí. Hãy thử lại.';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  });
}

