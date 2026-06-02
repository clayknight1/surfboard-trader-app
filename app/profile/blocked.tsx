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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getBlockedUsersWithProfiles,
  unblockUser,
} from '../../lib/services/blockService';
import { Colors, Spacing, Typography } from '../../constants';
import Screen from '../../components/ui/Screen';
import Avatar from '../../components/ui/Avatar';
import * as Haptics from 'expo-haptics';
import { displayName } from '../../lib/utils';
import * as Sentry from '@sentry/react-native';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { useRequireAuth } from '../../lib/useRequireAuth';
import EmptyState from '../../components/ui/EmptyState';

export default function BlockedUsersScreen() {
  const auth = useRequireAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ['blockedUsers', auth.userId],
    queryFn: () => getBlockedUsersWithProfiles(auth.userId!),
    enabled: !!auth.userId,
  });

  if (!auth.ready) {
    return auth.redirect ?? null;
  }

  const unblockMutation = useMutation({
    mutationFn: (blockedId: string) => unblockUser(auth.userId!, blockedId),
    onSuccess: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
    onError: (err) => {
      Sentry.captureException(err);
      Alert.alert(
        'Something went wrong',
        'Could not unblock user. Please try again.',
      );
    },
  });

  function handleUnblock(blockedId: string, name: string) {
    Alert.alert(
      'Unblock User',
      `Unblock ${name}? They will be able to message you and you will see their listings again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: () => unblockMutation.mutate(blockedId),
        },
      ],
    );
  }
  return (
    <Screen>
      <ScreenHeader title='Blocked Users' onBack={() => router.back()} />
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
              <EmptyState icon='ban-outline' title='No blocked users' />
            ) : null
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  },
});
