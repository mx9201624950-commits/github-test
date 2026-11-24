import { Alert, Platform } from 'react-native';

export function confirm(title: string, message: string, onOk: () => void, okText = '刪除') {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (globalThis.confirm?.(`${title}\n${message}`)) onOk();
    return;
  }
  Alert.alert(title, message, [
    { text: '取消', style: 'cancel' },
    { text: okText, style: 'destructive', onPress: onOk },
  ]);
}

export function notify(title: string, message: string) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    globalThis.alert?.(`${title}\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
