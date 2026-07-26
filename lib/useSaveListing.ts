import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import * as Haptics from 'expo-haptics';
import {
  getSavedListingIds,
  saveListing,
  unsaveListing,
} from './services/savedService';
import { usePostHog } from 'posthog-react-native';

export function useSaveListing(listingId: string, userId: string | undefined) {
  const queryClient = useQueryClient();
  const posthog = usePostHog();

  const { data: savedIds = [] } = useQuery({
    queryKey: ['savedIds', userId],
    queryFn: () => getSavedListingIds(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const isSaved = savedIds.includes(listingId);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not signed in');
      if (isSaved) {
        await unsaveListing(userId, listingId);
      } else {
        await saveListing(userId, listingId);
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['savedIds', userId] });
      const previous = queryClient.getQueryData<string[]>(['savedIds', userId]);
      queryClient.setQueryData<string[]>(['savedIds', userId], (old = []) =>
        isSaved ? old.filter((id) => id !== listingId) : [...old, listingId],
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      Sentry.captureException(err);
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['savedIds', userId], context.previous);
      }
    },
     onSuccess: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      if (!isSaved) {
        posthog?.capture('favorite_added', {
          listing_id: listingId,
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['savedIds'] });
      queryClient.invalidateQueries({ queryKey: ['savedListings'] });
    },
  });

  return {
    isSaved,
    toggle: () => mutation.mutate(),
    isPending: mutation.isPending,
  };
}
