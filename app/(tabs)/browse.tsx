import {
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
  Linking,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { buildFeed, FeedItem } from '../../lib/feedUtils';
import { FilterState } from '../../lib/types';
import ListingCard from '../../components/listings/ListingCard';
import { Colors, Spacing, Typography } from '../../constants';
import Screen from '../../components/ui/Screen';
import { getListings } from '../../lib/services/listingService';
import FilterBar, { FilterKey } from '../../components/listings/FilterBar';
import FilterPanel from '../../components/listings/FilterPanel';
import ListingCardSkeleton from '../../components/listings/ListingCardSkeleton';
import { useAuth } from '../../lib/auth';
import { Ionicons } from '@expo/vector-icons';

const PAGE_SIZE = 20;

export default function BrowseScreen() {
  const flatListRef = useRef<FlatList>(null);
  const [location, setLocation] = useState({ lat: 33.1959, lng: -117.3795 }); // Oceanside default
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [filterBarHeight, setFilterBarHeight] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    volumeMin: null,
    volumeMax: null,
    lengthMin: null,
    lengthMax: null,
    boardType: null,
    finSystem: null,
    finSetup: null,
    condition: null,
    priceMax: null,
    radiusMiles: 25,
    listingType: 'for_sale',
    shipsOnly: false,
  });
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skeletonData: FeedItem[] = Array.from({ length: 6 }, (_, i) => ({
    type: 'skeleton' as const,
    id: `skeleton-${i}`,
  }));
  const queryClient = useQueryClient();

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasLocationPermission(false);
        return;
      }

      setHasLocationPermission(true);
      let location = await Location.getCurrentPositionAsync();
      setLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    }
    getCurrentLocation();
  }, []);

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [filters]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const { isPending, isFetching, isError, data, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ['listings', location, filters],
      queryFn: ({ pageParam = 0 }) =>
        getListings(
          location.lat,
          location.lng,
          filters,
          userId,
          PAGE_SIZE,
          pageParam as number,
        ),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage || lastPage.length < PAGE_SIZE) {
          return undefined;
        }
        return allPages.length * PAGE_SIZE;
      },
      placeholderData: keepPreviousData,
      retry: 1,
      retryDelay: 2000,
      enabled: !!location,
      staleTime: 1000 * 60 * 5,
    });

  const feedItems = useMemo(() => buildFeed(data?.pages.flat() ?? []), [data]);

  const renderItem = useCallback(
    ({ item }: { item: FeedItem }) => {
      if (item.type === 'skeleton') return <ListingCardSkeleton />;
      if (item.type === 'listing' || item.type === 'boosted') {
        return <ListingCard listing={item.data} userId={userId} />;
      }
      return null;
    },
    [userId],
  );

  const keyExtractor = useCallback(
    (item: FeedItem) =>
      item.type === 'skeleton' ? item.id : `${item.type}-${item.data.id}`,
    [],
  );

  function handleFilterPress(key: FilterKey) {
    setOpenFilter((prev) => (prev === key ? null : key));
  }

  function handleReset(key: FilterKey) {
    const resets: Partial<FilterState> = {
      volume: { volumeMin: null, volumeMax: null },
      length: { lengthMin: null, lengthMax: null },
      boardType: { boardType: null },
      finSystem: { finSystem: null },
      radius: { radiusMiles: 25 },
    }[key];
    setFilters((prev) => ({ ...prev, ...resets }));
  }

  function handleFilterChange(updates: Partial<FilterState>) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, ...updates }));
    }, 500);
  }

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.resetQueries({ queryKey: ['listings'] });
    setIsRefreshing(false);
  }, [queryClient]);

  return (
    <Screen>
      <View style={{ flex: 1, position: 'relative' }}>
        <View onLayout={(e) => setFilterBarHeight(e.nativeEvent.layout.height)}>
          <FilterBar
            filters={filters}
            openFilter={openFilter}
            onFilterPress={handleFilterPress}
          />
          {!hasLocationPermission && (
            <TouchableOpacity
              style={styles.locationBanner}
              onPress={() => Linking.openSettings()}
            >
              <Ionicons
                name='location-outline'
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.locationBannerText}>
                Using default location — tap to enable location access
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          ref={flatListRef}
          numColumns={2}
          columnWrapperStyle={{ gap: Spacing.cardGap }}
          onEndReached={() => {
            if (hasNextPage && !isFetching) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetching && feedItems.some((i) => i.type === 'listing') ? (
              <ActivityIndicator
                color={Colors.accent}
                style={{ paddingVertical: Spacing.xl }}
              />
            ) : null
          }
          contentContainerStyle={{
            paddingHorizontal: Spacing.screenPadding,
            paddingTop: Spacing.screenPadding,
            paddingBottom: Spacing.xxl,
            rowGap: Spacing.cardGap,
          }}
          data={
            isFetching && !feedItems.some((i) => i.type === 'listing')
              ? skeletonData
              : feedItems
          }
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.accent}
            />
          }
          ListEmptyComponent={
            isError ? (
              <View
                style={{
                  height: Dimensions.get('window').height * 0.6,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: Spacing.screenPadding,
                }}
              >
                <Text
                  style={{
                    ...Typography.body,
                    color: Colors.textSecondary,
                    textAlign: 'center',
                  }}
                >
                  Something went wrong. Pull down to try again.
                </Text>
              </View>
            ) : !isPending && !isFetching && feedItems.length === 0 ? (
              <View
                style={{
                  height: Dimensions.get('window').height * 0.6,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: Spacing.screenPadding,
                  gap: Spacing.md,
                }}
              >
                <Ionicons
                  name='search-outline'
                  size={48}
                  color={Colors.textSecondary}
                />
                <Text
                  style={{
                    ...Typography.subheading,
                    color: Colors.textPrimary,
                  }}
                >
                  No boards nearby
                </Text>
                <Text
                  style={{
                    ...Typography.body,
                    color: Colors.textSecondary,
                    textAlign: 'center',
                  }}
                >
                  Try increasing your search radius or check back later
                </Text>
              </View>
            ) : null
          }
        />
        <FilterPanel
          openFilter={openFilter}
          filters={filters}
          onClose={() => setOpenFilter(null)}
          onReset={handleReset}
          onFilterChange={handleFilterChange}
          style={{
            position: 'absolute',
            top: filterBarHeight,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundSubtle,
  },
  locationBannerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
