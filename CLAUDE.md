# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — Expo dev server (Metro). Press `i`/`a` to launch the iOS/Android simulator.
- `npm run ios` / `npm run android` — `expo run:*`, builds and launches a native dev client (needed when any native dep changes — Metro reload alone won't pick it up).
- `npm run web` — Expo web target.
- TypeScript is strict; there is no separate lint/test script. `npx tsc --noEmit` to type-check.
- Regenerate Supabase types: `npx supabase gen types typescript --project-id <id> > lib/database.types.ts` (the `supabase` CLI is a devDependency).
- Required env (in `.env` / `.env.local`): `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY`, `EXPO_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_POSTHOG_KEY`.

## Architecture

**Stack:** Expo SDK 54 + React Native 0.81 (new arch enabled) + expo-router v6 (file-based) + Supabase + TanStack Query v5 (persisted to AsyncStorage) + Sentry + PostHog. Entry is `index.ts` → `expo-router/entry` → `app/_layout.tsx`.

**Provider tree** (`app/_layout.tsx`): `Sentry.wrap` → `GestureHandlerRootView` → `PostHogProvider` → `PersistQueryClientProvider` (24h gcTime, `buster: 'v4'` — bump when query shapes change) → `SafeAreaProvider` → `AuthProvider` → expo-router `Stack`. `app/index.tsx` redirects authed-or-not into `/(tabs)/browse`.

**Routing** (`app/`):
- `(tabs)/` — `browse`, `sell`, `messages`, `favorites`, `profile`. Tab bar lives in `(tabs)/_layout.tsx` and reads `unreadCount` from `useAuth`.
- `auth/` — `login`, `sign-up`, `apply` (business application).
- `listings/create.tsx`, `listings/[id]/index.tsx`, `listings/[id]/edit.tsx`.
- `messages/[threadId].tsx`, `messages/new.tsx`. `users/[userId].tsx` for public profiles. `profile/{edit,blocked,business}`. `legal/{privacy-policy,terms}`.

**Auth** (`lib/auth.tsx`): `AuthProvider` is the single source of truth for `session`, `user` (Supabase), `profile` (joined `users` + `business_profiles`), and `unreadCount`. It also owns a `messages` realtime subscription that refetches `unreadCount` on INSERT. Initial `getSession` is wrapped in a 10s race and shows a connection alert on timeout. Always read auth state via `useAuth()`; do not call `supabase.auth` directly from screens.

**Data layer — services in `lib/services/`:** All Supabase access funnels through these modules — screens import service functions, not the Supabase client. Listing reads/writes prefer **Postgres RPCs** (`get_listings_nearby`, `create_listing`, `update_listing_location`, `get_inbox`, `send_message`) over direct table queries — RPCs encapsulate location/distance math, RLS-friendly joins, and atomic multi-table writes. When adding queries, check if an RPC already exists before building a chained `.from().select()`.

**Image URLs:** Photos are stored in the `listings` and `avatars` Supabase Storage buckets. Never render `storage_path` directly — pass it through `getTransformUrl(bucket, path, width, quality?)` (in `lib/utils.ts`), which builds a Supabase image-transform URL. Services already do this for their return values (card lists at 400px, detail at 800px, thumbnails at 160px); follow that convention.

**Feed composition** (`lib/feedUtils.ts`): `buildFeed(organic, boosted)` interleaves a boosted listing every `BOOSTED_FREQUENCY` (8) organic items. Browse uses FlashList with this feed shape (`type: 'listing' | 'boosted' | 'skeleton'`).

**React Query:** Default `gcTime` is 24h with AsyncStorage persistence, so cached lists survive cold starts. Use stable `queryKey`s (e.g. `['userListings', userId]`) and invalidate via `queryClient.invalidateQueries` after mutations. Bump the persister `buster` string in `_layout.tsx` if you change a query's data shape incompatibly.

**Types** (`lib/types.ts`): Wraps generated `Database` types from `lib/database.types.ts` (Supabase-generated — do not hand-edit). `ListingFormData` is the multi-step form shape (note `length_feet` + `length_inches_remainder` split — services recombine into `length_inches` before writing). `User` is always joined with `business_profiles` in this codebase.

**Listing creation flow:** `app/listings/create.tsx` drives `components/listings/steps/Step{Type,Details,Specs,Pricing,Location,Photos}.tsx`. Photos are pre-processed by `processPhoto` in `lib/utils.ts` (crop to 4:5, resize 1200px, JPEG 0.8) before upload via `uploadListingPhotos`.

**Locale & units:** `measurementSystem` and `userCurrency` are read once from `expo-localization` at module load in `lib/utils.ts`. `formatPrice`, `formatLength` (feet/inches with vulgar-fraction glyphs), `formatDistance` (km vs mi) all key off these.

**Tiers / limits:** User tiers are `free` (5 active listings), `starter` (25), `pro` (∞), `business` (∞) — enforced in `app/(tabs)/sell.tsx` against the count from `getUserListingCount`.

**Styling:** All design tokens live in `constants/` (`Colors`, `Typography`, `Spacing`) re-exported from `constants/index.ts`. `constants/listingOptions.ts` holds enum option lists (board types, fin systems, conditions, etc.) used by step components and filters. Use these constants — do not inline hex codes or magic spacing.

**Error reporting:** Service functions log to `console.error` and most also call `Sentry.captureException` with extra context. Throw the error after capture so React Query surfaces it.
