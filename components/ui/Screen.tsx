import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Colors } from '../../constants';
import { View } from 'react-native';

type ScreenProps = {
  children: React.ReactNode;
  bottomInset?: boolean;
};

export default function Screen({ children, bottomInset = false }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: insets.top,
        paddingBottom: bottomInset ? insets.bottom : 0,
      }}
    >
      {children}
    </View>
  );
}
