import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants';
import { ThreadPreview } from '../../lib/types';
import Avatar from '../ui/Avatar';
import { displayName } from '../../lib/utils';

type ThreadRowProps = {
  thread: ThreadPreview;
  currentUserId: string;
  onPress: () => void;
};

function formatTime(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ThreadRow({
  thread,
  currentUserId,
  onPress,
}: ThreadRowProps) {
  const otherUser =
    thread.buyer.id === currentUserId ? thread.seller : thread.buyer;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Avatar
        avatarUrl={otherUser.avatar_url ?? null}
        fullName={otherUser.full_name ?? null}
        size={44}
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName(otherUser.full_name)}
          </Text>
          <Text style={styles.time}>{formatTime(thread.last_message_at)}</Text>
        </View>
        <Text style={styles.listing} numberOfLines={1}>
          {thread.listing.title}
        </Text>
        <Text style={styles.preview} numberOfLines={1}>
          {thread.last_message ?? 'No messages yet'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.screenPadding,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    flex: 1,
  },
  time: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  listing: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  preview: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
