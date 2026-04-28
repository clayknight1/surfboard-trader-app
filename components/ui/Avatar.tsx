import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Typography } from '../../constants';

type AvatarProps = {
  avatarUrl: string | null;
  fullName: string | null;
  size?: number;
  shape?: 'circle' | 'rounded';
};

export default function Avatar({
  avatarUrl,
  fullName,
  size = 40,
  shape = 'circle',
}: AvatarProps) {
  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';
  const borderRadius = shape === 'rounded' ? size * 0.15 : size / 2;

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[styles.avatar, { width: size, height: size, borderRadius }]}
        contentFit={shape === 'rounded' ? 'contain' : 'cover'}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: Colors.backgroundSubtle,
  },
  fallback: {
    backgroundColor: Colors.backgroundSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
});
