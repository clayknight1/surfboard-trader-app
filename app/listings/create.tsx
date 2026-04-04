import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { ListingFormData } from '../../lib/types';

export default function CreateListing() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [step, setStep] = useState();
  const [formData, setFormData] = useState<ListingFormData>({
    listing_type: 'used',
    title: '',
    description: null,
    price: null,
    board_type: null,
    volume: null,
    length_feet: null,
    length_inches_remainder: null,
    width_inches: null,
    thickness_inches: null,
    fin_system: null,
    fin_setup: null,
    shaper_brand: null,
    condition: null,
    era: null,
    is_rideable: null,
    provenance: null,
    lead_time_weeks: null,
    lat: null,
    lng: null,
    location_label: null,
    ships_domestically: false,
    ships_internationally: false,
    shipping_notes: null,
    accepts_offers: false,
    payment_notes: null,
    currency: 'USD',
    user_id: userId!,
  });

  function updateField<K extends keyof ListingFormData>(
    key: K,
    value: ListingFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }
}
