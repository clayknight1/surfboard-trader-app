import { Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../constants';

type FormErrorProps = {
  children: string | null | undefined;
};

export default function FormError({ children }: FormErrorProps) {
  if (!children) return null;

  return <Text style={styles.error}>{children}</Text>;
}

const styles = StyleSheet.create({
  error: {
    ...Typography.caption,
    color: Colors.error,
  },
});
