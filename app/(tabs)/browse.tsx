import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ListingCardData } from '../../lib/types';
import { supabase } from '../../lib/supabase';
import ListingCard from '../../components/listings/ListingCard';
import { Spacing } from '../../constants';
import Screen from '../../components/ui/Screen';

export default function BrowseScreen() {
  const [location, setLocation] = useState({ lat: 33.1959, lng: -117.3795 }); // Oceanside default
  const [error, setError] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [radius, setRadius] = useState<number>(25);

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

  const { isPending, isError, data } = useQuery({
    queryKey: ['listings', location, radius],
    queryFn: () => getListings(),
    initialData: [],
  });

  async function getListings(): Promise<ListingCardData[]> {
    try {
      setError(null);
      const { data, error } = await supabase.rpc('get_listings_nearby', {
        p_lat: location.lat,
        p_lng: location.lng,
        p_radius_miles: radius,
      });

      if (error) {
        console.error('Supabase error:', error);
        setError(error.message);
        return [];
      }

      return data ?? [];
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Something went wrong fetching listings');
      return [];
    }
  }

  if (isPending) {
    return <ActivityIndicator />;
  }

  if (isError) {
    return <Text>Something went wrong</Text>;
  }

  return (
    <Screen>
      <FlatList
        numColumns={2}
        columnWrapperStyle={{
          gap: Spacing.cardGap,
        }}
        contentContainerStyle={{
          paddingHorizontal: Spacing.screenPadding,
          paddingTop: Spacing.screenPadding,
          paddingBottom: Spacing.xxl,
          rowGap: Spacing.cardGap,
        }}
        data={data}
        renderItem={({ item }) => <ListingCard listing={item}></ListingCard>}
        keyExtractor={(item) => item.id}
      />
    </Screen>
  );
}
