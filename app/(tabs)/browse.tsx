import { Text, FlatList, ActivityIndicator, View } from 'react-native';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FilterState, ListingCardData } from '../../lib/types';
import ListingCard from '../../components/listings/ListingCard';
import { Colors, Spacing } from '../../constants';
import Screen from '../../components/ui/Screen';
import { getListings } from '../../lib/services/listingService';
import FilterBar, { FilterKey } from '../../components/listings/FilterBar';
import FilterPanel from '../../components/listings/FilterPanel';
import ListingCardSkeleton from '../../components/listings/ListingCardSkeleton';
import { useAuth } from '../../lib/auth';

export default function BrowseScreen() {
  const [location, setLocation] = useState({ lat: 33.1959, lng: -117.3795 }); // Oceanside default
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
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
  const skeletonData = Array.from({ length: 6 }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

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
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const { isPending, isError, data } = useQuery({
    queryKey: ['listings', location, filters],
    queryFn: () => getListings(location.lat, location.lng, filters, userId),
    placeholderData: keepPreviousData,
    enabled: !!location,
  });

  if (isError) {
    return <Text>Something went wrong</Text>;
  }

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

  return (
    <Screen>
      <View style={{ flex: 1, position: 'relative' }}>
        <View onLayout={(e) => setFilterBarHeight(e.nativeEvent.layout.height)}>
          <FilterBar
            filters={filters}
            openFilter={openFilter}
            onFilterPress={handleFilterPress}
          />
        </View>
        <FlatList
          numColumns={2}
          columnWrapperStyle={{ gap: Spacing.cardGap }}
          contentContainerStyle={{
            paddingHorizontal: Spacing.screenPadding,
            paddingTop: Spacing.screenPadding,
            paddingBottom: Spacing.xxl,
            rowGap: Spacing.cardGap,
          }}
          data={isPending ? skeletonData : (data ?? [])}
          renderItem={({ item }) =>
            isPending ? (
              <ListingCardSkeleton />
            ) : (
              <ListingCard listing={item as ListingCardData} />
            )
          }
          keyExtractor={(item) => item.id}
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
