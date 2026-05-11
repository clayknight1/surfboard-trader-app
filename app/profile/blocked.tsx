import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import {
  getBlockedUsersWithProfiles,
  unblockUser,
} from '../../lib/services/blockService';
import { Colors, Spacing, Typography } from '../../constants';
import Screen from '../../components/ui/Screen';
import Avatar from '../../components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { displayName } from '../../lib/utils';

export default function BlockedUsersScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id!;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ['blockedUsers', userId],
    queryFn: () => getBlockedUsersWithProfiles(userId),
    enabled: !!userId,
  });

  async function handleUnblock(blockedId: string, name: string) {
    Alert.alert(
      'Unblock User',
      `Unblock ${name}? They will be able to message you and you will see their listings again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await unblockUser(userId, blockedId);
              queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
              queryClient.invalidateQueries({ queryKey: ['listings'] });
            } catch {
              Alert.alert(
                'Something went wrong',
                'Could not unblock user. Please try again.',
              );
            }
          },
        },
      ],
    );
  }

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name='chevron-back' size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blocked Users</Text>
        <View style={{ width: 24 }} />
      </View>

      {isPending ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Avatar
                avatarUrl={item.avatar_url ?? null}
                fullName={item.full_name ?? null}
                size={40}
              />
              <Text style={styles.name}>{displayName(item.full_name)}</Text>
              <TouchableOpacity
                style={styles.unblockButton}
                onPress={() =>
                  handleUnblock(item.id, item.full_name?.trim() || 'this user')
                }
              >
                <Text style={styles.unblockText}>Unblock</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            !isPending ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No blocked users</Text>
              </View>
            ) : null
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },
  list: {
    padding: Spacing.screenPadding,
    gap: Spacing.sm,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.backgroundSubtle,
    borderRadius: 12,
    padding: Spacing.md,
  },
  name: {
    ...Typography.body,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  unblockButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unblockText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
