import { Database } from './database.types';

// Base table types
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type Listing = Database['public']['Tables']['listings']['Row'];
export type ListingInsert = Database['public']['Tables']['listings']['Insert'];
export type ListingUpdate = Database['public']['Tables']['listings']['Update'];

export type ListingPhoto =
  Database['public']['Tables']['listing_photos']['Row'];
export type ListingPhotoInsert =
  Database['public']['Tables']['listing_photos']['Insert'];

export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export type SavedListing =
  Database['public']['Tables']['saved_listings']['Row'];
export type BusinessProfile =
  Database['public']['Tables']['business_profiles']['Row'];
export type BusinessProfileInsert =
  Database['public']['Tables']['business_profiles']['Insert'];
export type BusinessProfileUpdate =
  Database['public']['Tables']['business_profiles']['Update'];

// Enum types
export type UserRole = Database['public']['Enums']['user_role'];
export type UserTier = Database['public']['Enums']['user_tier'];
export type ListingType = Database['public']['Enums']['listing_type'];
export type ListingStatus = Database['public']['Enums']['listing_status'];
export type BoardType = Database['public']['Enums']['board_type'];
export type FinSystem = Database['public']['Enums']['fin_system'];
export type FinSetup = Database['public']['Enums']['fin_setup'];
export type BoardCondition = Database['public']['Enums']['board_condition'];
export type BoardEra = Database['public']['Enums']['board_era'];
export type SponsoredTier = Database['public']['Enums']['sponsored_tier'];

// Joined / extended types
export type ListingWithDetails = Listing & {
  listing_photos: ListingPhoto[];
  users: Pick<
    User,
    'id' | 'full_name' | 'avatar_url' | 'is_verified' | 'created_at'
  >;
};

export type ListingWithPrimaryPhoto = Listing & {
  listing_photos: Pick<ListingPhoto, 'storage_path' | 'is_primary'>[];
};

// Form types
export type ListingFormData = Omit<ListingInsert, 'length_inches'> & {
  length_feet: number | null;
  length_inches_remainder: number | null;
};

export type FilterState = {
  volumeMin: number | null;
  volumeMax: number | null;
  boardType: BoardType | null;
  finSystem: FinSystem | null;
  finSetup: FinSetup | null;
  condition: BoardCondition | null;
  priceMax: number | null;
  radiusMiles: number;
  listingType: ListingType;
  shipsOnly: boolean;
};

// UI types
export type TabRoute = 'browse' | 'sell' | 'messages' | 'profile';
