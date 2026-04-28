import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { useRouter } from 'expo-router';
import Screen from '../../components/ui/Screen';
import SignInPrompt from '../../components/ui/SignInPrompt';
import Avatar from '../../components/ui/Avatar';
import { Colors, Spacing, Typography } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import LocationSheet from '../../components/ui/LocationSheet';
import { supabase } from '../../lib/supabase';
import { submitDeletionRequest } from '../../lib/services/userService';

type SettingsRowProps = {
  label: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
};

function SettingsRow({ label, value, onPress, destructive }: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Text
        style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}
      >
        {label}
      </Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {!destructive && (
          <Ionicons
            name='chevron-forward'
            size={16}
            color={Colors.textSecondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { session, loading, profile, signOut } = useAuth();
  const router = useRouter();
  const userId = session?.user?.id;
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const isShopOrShaper = profile?.role === 'shop' || profile?.role === 'shaper';

  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This cannot be undone. We will process your request within 24 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Deletion',
          style: 'destructive',
          onPress: async () => {
            try {
              await submitDeletionRequest(userId!);
              await supabase.auth.signOut();
              router.replace('/auth/login');
            } catch {
              Alert.alert(
                'Something went wrong',
                'Could not submit your request. Please try again.',
              );
            }
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      </Screen>
    );
  }

  if (!userId) {
    return (
      <Screen>
        <SignInPrompt
          icon='person-outline'
          title='Sign in to view your profile'
          subtitle='Manage your listings, location, and account settings'
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Avatar + name */}
        <View style={styles.identity}>
          <Avatar
            avatarUrl={profile?.avatar_url ?? null}
            fullName={profile?.full_name ?? null}
            size={72}
          />
          <View style={styles.identityText}>
            <Text style={styles.name}>
              {profile?.full_name ?? 'No name set'}
            </Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>
                {profile?.tier
                  ? profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)
                  : 'Free'}
              </Text>
            </View>
          </View>
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              label='Edit Profile'
              onPress={() => router.push('/profile/edit')}
            />
            <SettingsRow
              label='Location'
              value={profile?.location_label ?? 'Not set'}
              onPress={() => setLocationSheetOpen(true)}
            />
          </View>
        </View>

        {isShopOrShaper && !profile?.business_profiles && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Business</Text>
            <View style={styles.sectionContent}>
              <SettingsRow
                label='Set up your business profile'
                onPress={() => router.push('/profile/business')}
              />
            </View>
          </View>
        )}

        {isShopOrShaper && profile?.business_profiles && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Business</Text>
            <View style={styles.sectionContent}>
              <SettingsRow
                label='Edit business profile'
                onPress={() => router.push('/profile/business')}
              />
            </View>
          </View>
        )}

        {/* Plan section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Plan</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              label='Upgrade'
              value={
                profile?.tier
                  ? profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)
                  : 'Free'
              }
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Sign out */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <SettingsRow label='Sign Out' onPress={signOut} destructive />
            <SettingsRow
              label='Delete Account'
              onPress={handleDeleteAccount}
              destructive
            />
          </View>
        </View>
      </ScrollView>
      <LocationSheet
        isOpen={locationSheetOpen}
        onClose={() => setLocationSheetOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingBottom: Spacing.xxxl,
  },
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.heading,
    color: Colors.textPrimary,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.xl,
  },
  identityText: {
    gap: Spacing.xs,
  },
  name: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.backgroundSubtle,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tierText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.sm,
  },
  sectionContent: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundSubtle,
  },
  rowLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  rowLabelDestructive: {
    color: Colors.error,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowValue: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
