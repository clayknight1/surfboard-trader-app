import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants';

type ScreenProps = {
  children: React.ReactNode;
};

export default function Screen({ children }: ScreenProps) {
  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      {children}
    </SafeAreaView>
  );
}
