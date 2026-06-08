create extension if not exists "hypopg" with schema "extensions";

create extension if not exists "index_advisor" with schema "extensions";

create extension if not exists "postgis" with schema "extensions";

drop extension if exists "pg_net";

create type "public"."board_condition" as enum ('new', 'excellent', 'good', 'fair', 'poor');

create type "public"."board_era" as enum ('1950s', '1960s', '1970s', '1980s', '1990s');

create type "public"."board_type" as enum ('shortboard', 'longboard', 'midlength', 'fish', 'hybrid', 'groveler', 'step_up', 'gun', 'soft_top', 'sup', 'foilboard', 'other');

create type "public"."fin_setup" as enum ('single', 'twin', 'thruster', 'quad', 'five_fin', '2_plus_1', 'other');

create type "public"."fin_system" as enum ('fcs2', 'futures', 'fcs1', 'single', 'other', 'unknown');

create type "public"."listing_status" as enum ('active', 'sold', 'hidden', 'pending_review', 'deleted');

create type "public"."listing_type" as enum ('for_sale', 'in_stock', 'vintage', 'custom_order');

create type "public"."message_status" as enum ('sent', 'delivered', 'read');

create type "public"."sponsored_tier" as enum ('basic', 'featured', 'premium');

create type "public"."user_role" as enum ('buyer_seller', 'shop', 'shaper', 'admin');

create type "public"."user_tier" as enum ('free', 'starter', 'pro', 'business');


  create table "public"."blocked_users" (
    "id" uuid not null default gen_random_uuid(),
    "blocker_id" uuid not null,
    "blocked_id" uuid not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."blocked_users" enable row level security;


  create table "public"."business_applications" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "business_name" text not null,
    "business_type" text not null,
    "location_label" text,
    "website" text,
    "instagram_handle" text,
    "description" text,
    "status" text not null default 'pending'::text,
    "created_at" timestamp with time zone not null default now(),
    "reviewed_at" timestamp with time zone
      );


alter table "public"."business_applications" enable row level security;


  create table "public"."business_profiles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "business_name" text not null,
    "bio" text,
    "website" text,
    "instagram_handle" text,
    "location" extensions.geography(Point,4326),
    "location_label" text,
    "service_radius_miles" integer,
    "price_range_low" integer,
    "price_range_high" integer,
    "is_sponsored" boolean not null default false,
    "sponsored_until" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "logo_url" text,
    "slug" text,
    "lat" double precision,
    "lng" double precision
      );


alter table "public"."business_profiles" enable row level security;


  create table "public"."deletion_requests" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "processed_at" timestamp with time zone,
    "status" text default 'pending'::text
      );


alter table "public"."deletion_requests" enable row level security;


  create table "public"."listing_photos" (
    "id" uuid not null default gen_random_uuid(),
    "listing_id" uuid not null,
    "storage_path" text not null,
    "display_order" integer not null default 0,
    "is_primary" boolean not null default false,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."listing_photos" enable row level security;


  create table "public"."listings" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "listing_type" public.listing_type not null default 'for_sale'::public.listing_type,
    "status" public.listing_status not null default 'active'::public.listing_status,
    "title" text not null,
    "description" text,
    "price" integer not null,
    "accepts_offers" boolean not null default false,
    "payment_notes" text,
    "board_type" public.board_type,
    "volume" numeric(5,1),
    "length_inches" numeric(5,2),
    "width_inches" numeric(4,2),
    "thickness_inches" numeric(4,2),
    "fin_system" public.fin_system,
    "fin_setup" public.fin_setup,
    "shaper_brand" text,
    "condition" public.board_condition,
    "era" public.board_era,
    "is_rideable" boolean,
    "provenance" text,
    "lead_time_weeks" integer,
    "location" extensions.geography(Point,4326),
    "location_label" text,
    "ships_domestically" boolean not null default false,
    "ships_internationally" boolean not null default false,
    "shipping_notes" text,
    "is_sponsored" boolean not null default false,
    "sponsored_until" timestamp with time zone,
    "sponsored_tier" public.sponsored_tier,
    "is_featured" boolean not null default false,
    "view_count" integer not null default 0,
    "save_count" integer not null default 0,
    "bump_count" integer not null default 0,
    "last_bumped_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "currency" text not null default 'USD'::text,
    "business_id" uuid
      );


alter table "public"."listings" enable row level security;


  create table "public"."messages" (
    "id" uuid not null default gen_random_uuid(),
    "listing_id" uuid not null,
    "sender_id" uuid not null,
    "recipient_id" uuid not null,
    "body" text not null,
    "status" public.message_status not null default 'sent'::public.message_status,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "thread_id" uuid not null,
    "business_id" uuid
      );


alter table "public"."messages" enable row level security;


  create table "public"."reports" (
    "id" uuid not null default gen_random_uuid(),
    "reporter_id" uuid not null,
    "reported_user_id" uuid,
    "reported_listing_id" uuid,
    "reason" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."reports" enable row level security;


  create table "public"."saved_listings" (
    "user_id" uuid not null,
    "listing_id" uuid not null,
    "saved_at" timestamp with time zone not null default now()
      );


alter table "public"."saved_listings" enable row level security;


  create table "public"."threads" (
    "id" uuid not null default gen_random_uuid(),
    "listing_id" uuid not null,
    "buyer_id" uuid,
    "seller_id" uuid,
    "last_message_at" timestamp with time zone,
    "last_message" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."threads" enable row level security;


  create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "email" text not null,
    "phone" text,
    "username" text,
    "full_name" text,
    "avatar_url" text,
    "bio" text,
    "location" extensions.geography(Point,4326),
    "location_label" text,
    "role" public.user_role not null default 'buyer_seller'::public.user_role,
    "tier" public.user_tier not null default 'free'::public.user_tier,
    "tier_expires_at" timestamp with time zone,
    "is_verified" boolean not null default false,
    "is_active" boolean not null default true,
    "stripe_customer_id" text,
    "last_seen_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "lat" double precision,
    "lng" double precision,
    "currency" text not null,
    "is_banned" boolean not null default false
      );


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX blocked_users_blocker_id_blocked_id_key ON public.blocked_users USING btree (blocker_id, blocked_id);

CREATE UNIQUE INDEX blocked_users_pkey ON public.blocked_users USING btree (id);

CREATE UNIQUE INDEX business_applications_pkey ON public.business_applications USING btree (id);

CREATE UNIQUE INDEX business_profiles_pkey ON public.business_profiles USING btree (id);

CREATE UNIQUE INDEX business_profiles_slug_key ON public.business_profiles USING btree (slug);

CREATE UNIQUE INDEX business_profiles_user_id_key ON public.business_profiles USING btree (user_id);

CREATE UNIQUE INDEX deletion_requests_pkey ON public.deletion_requests USING btree (id);

CREATE INDEX idx_business_profiles_location ON public.business_profiles USING gist (location);

CREATE INDEX idx_business_profiles_sponsored ON public.business_profiles USING btree (is_sponsored, sponsored_until);

CREATE INDEX idx_business_profiles_user ON public.business_profiles USING btree (user_id);

CREATE INDEX idx_listings_board_type ON public.listings USING btree (board_type);

CREATE INDEX idx_listings_created ON public.listings USING btree (created_at DESC);

CREATE INDEX idx_listings_fin_system ON public.listings USING btree (fin_system);

CREATE INDEX idx_listings_length ON public.listings USING btree (length_inches);

CREATE INDEX idx_listings_location ON public.listings USING gist (location);

CREATE INDEX idx_listings_price ON public.listings USING btree (price);

CREATE INDEX idx_listings_sponsored ON public.listings USING btree (is_sponsored, sponsored_until);

CREATE INDEX idx_listings_status ON public.listings USING btree (status);

CREATE INDEX idx_listings_type ON public.listings USING btree (listing_type);

CREATE INDEX idx_listings_user ON public.listings USING btree (user_id);

CREATE INDEX idx_listings_volume ON public.listings USING btree (volume);

CREATE INDEX idx_messages_listing ON public.messages USING btree (listing_id, created_at);

CREATE INDEX idx_messages_recipient ON public.messages USING btree (recipient_id, read_at);

CREATE INDEX idx_messages_sender ON public.messages USING btree (sender_id);

CREATE INDEX idx_messages_thread ON public.messages USING btree (thread_id, created_at);

CREATE INDEX idx_photos_listing ON public.listing_photos USING btree (listing_id, display_order);

CREATE INDEX idx_photos_listing_primary ON public.listing_photos USING btree (listing_id, is_primary) WHERE (is_primary = true);

CREATE INDEX idx_saved_listing ON public.saved_listings USING btree (listing_id);

CREATE INDEX idx_saved_user ON public.saved_listings USING btree (user_id);

CREATE INDEX idx_threads_buyer ON public.threads USING btree (buyer_id, last_message_at DESC);

CREATE INDEX idx_threads_seller ON public.threads USING btree (seller_id, last_message_at DESC);

CREATE INDEX idx_users_banned ON public.users USING btree (id) WHERE (is_banned = true);

CREATE INDEX idx_users_location ON public.users USING gist (location);

CREATE UNIQUE INDEX listing_photos_pkey ON public.listing_photos USING btree (id);

CREATE UNIQUE INDEX listings_pkey ON public.listings USING btree (id);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE UNIQUE INDEX reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX saved_listings_pkey ON public.saved_listings USING btree (user_id, listing_id);

CREATE UNIQUE INDEX threads_listing_id_buyer_id_seller_id_key ON public.threads USING btree (listing_id, buyer_id, seller_id);

CREATE UNIQUE INDEX threads_pkey ON public.threads USING btree (id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_phone_key ON public.users USING btree (phone);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX users_stripe_customer_id_key ON public.users USING btree (stripe_customer_id);

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);

alter table "public"."blocked_users" add constraint "blocked_users_pkey" PRIMARY KEY using index "blocked_users_pkey";

alter table "public"."business_applications" add constraint "business_applications_pkey" PRIMARY KEY using index "business_applications_pkey";

alter table "public"."business_profiles" add constraint "business_profiles_pkey" PRIMARY KEY using index "business_profiles_pkey";

alter table "public"."deletion_requests" add constraint "deletion_requests_pkey" PRIMARY KEY using index "deletion_requests_pkey";

alter table "public"."listing_photos" add constraint "listing_photos_pkey" PRIMARY KEY using index "listing_photos_pkey";

alter table "public"."listings" add constraint "listings_pkey" PRIMARY KEY using index "listings_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."reports" add constraint "reports_pkey" PRIMARY KEY using index "reports_pkey";

alter table "public"."saved_listings" add constraint "saved_listings_pkey" PRIMARY KEY using index "saved_listings_pkey";

alter table "public"."threads" add constraint "threads_pkey" PRIMARY KEY using index "threads_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."blocked_users" add constraint "blocked_users_blocked_id_fkey" FOREIGN KEY (blocked_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."blocked_users" validate constraint "blocked_users_blocked_id_fkey";

alter table "public"."blocked_users" add constraint "blocked_users_blocker_id_blocked_id_key" UNIQUE using index "blocked_users_blocker_id_blocked_id_key";

alter table "public"."blocked_users" add constraint "blocked_users_blocker_id_fkey" FOREIGN KEY (blocker_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."blocked_users" validate constraint "blocked_users_blocker_id_fkey";

alter table "public"."business_applications" add constraint "business_applications_business_type_check" CHECK ((business_type = ANY (ARRAY['shop'::text, 'shaper'::text]))) not valid;

alter table "public"."business_applications" validate constraint "business_applications_business_type_check";

alter table "public"."business_applications" add constraint "business_applications_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))) not valid;

alter table "public"."business_applications" validate constraint "business_applications_status_check";

alter table "public"."business_applications" add constraint "business_applications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."business_applications" validate constraint "business_applications_user_id_fkey";

alter table "public"."business_profiles" add constraint "business_profiles_slug_key" UNIQUE using index "business_profiles_slug_key";

alter table "public"."business_profiles" add constraint "business_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."business_profiles" validate constraint "business_profiles_user_id_fkey";

alter table "public"."business_profiles" add constraint "business_profiles_user_id_key" UNIQUE using index "business_profiles_user_id_key";

alter table "public"."deletion_requests" add constraint "deletion_requests_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'processed'::text]))) not valid;

alter table "public"."deletion_requests" validate constraint "deletion_requests_status_check";

alter table "public"."deletion_requests" add constraint "deletion_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."deletion_requests" validate constraint "deletion_requests_user_id_fkey";

alter table "public"."listing_photos" add constraint "listing_photos_listing_id_fkey" FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE not valid;

alter table "public"."listing_photos" validate constraint "listing_photos_listing_id_fkey";

alter table "public"."listings" add constraint "listings_business_id_fkey" FOREIGN KEY (business_id) REFERENCES public.business_profiles(id) not valid;

alter table "public"."listings" validate constraint "listings_business_id_fkey";

alter table "public"."listings" add constraint "listings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."listings" validate constraint "listings_user_id_fkey";

alter table "public"."messages" add constraint "messages_business_id_fkey" FOREIGN KEY (business_id) REFERENCES public.business_profiles(id) not valid;

alter table "public"."messages" validate constraint "messages_business_id_fkey";

alter table "public"."messages" add constraint "messages_listing_id_fkey" FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_listing_id_fkey";

alter table "public"."messages" add constraint "messages_recipient_id_fkey" FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_recipient_id_fkey";

alter table "public"."messages" add constraint "messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_sender_id_fkey";

alter table "public"."messages" add constraint "messages_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES public.threads(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_thread_id_fkey";

alter table "public"."reports" add constraint "reports_reported_listing_id_fkey" FOREIGN KEY (reported_listing_id) REFERENCES public.listings(id) ON DELETE SET NULL not valid;

alter table "public"."reports" validate constraint "reports_reported_listing_id_fkey";

alter table "public"."reports" add constraint "reports_reported_user_id_fkey" FOREIGN KEY (reported_user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."reports" validate constraint "reports_reported_user_id_fkey";

alter table "public"."reports" add constraint "reports_reporter_id_fkey" FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_reporter_id_fkey";

alter table "public"."saved_listings" add constraint "saved_listings_listing_id_fkey" FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE not valid;

alter table "public"."saved_listings" validate constraint "saved_listings_listing_id_fkey";

alter table "public"."saved_listings" add constraint "saved_listings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."saved_listings" validate constraint "saved_listings_user_id_fkey";

alter table "public"."threads" add constraint "threads_buyer_id_fkey" FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."threads" validate constraint "threads_buyer_id_fkey";

alter table "public"."threads" add constraint "threads_listing_id_buyer_id_seller_id_key" UNIQUE using index "threads_listing_id_buyer_id_seller_id_key";

alter table "public"."threads" add constraint "threads_listing_id_fkey" FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE not valid;

alter table "public"."threads" validate constraint "threads_listing_id_fkey";

alter table "public"."threads" add constraint "threads_seller_id_fkey" FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."threads" validate constraint "threads_seller_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_phone_key" UNIQUE using index "users_phone_key";

alter table "public"."users" add constraint "users_stripe_customer_id_key" UNIQUE using index "users_stripe_customer_id_key";

alter table "public"."users" add constraint "users_username_key" UNIQUE using index "users_username_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_listing(p_user_id uuid, p_listing_type public.listing_type, p_title text, p_description text, p_price integer, p_board_type public.board_type, p_volume numeric, p_length_inches numeric, p_width_inches numeric, p_thickness_inches numeric, p_fin_system public.fin_system, p_fin_setup public.fin_setup, p_shaper_brand text, p_condition public.board_condition, p_location_label text, p_currency text, p_era public.board_era, p_is_rideable boolean, p_provenance text, p_lead_time_weeks integer, p_lat double precision, p_lng double precision)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
declare
  v_listing_id uuid;
  v_listing_count int;
  v_tier_limit int;
begin
  -- Auth check
  if auth.uid() != p_user_id then
    raise exception 'Unauthorized';
  end if;

  -- Check listing limit
  select count(*) into v_listing_count
  from listings
  where user_id = p_user_id
  and status = 'active';

  select case
    when tier = 'free' then 5
    when tier = 'starter' then 25
    when tier = 'pro' then 999999
    when tier = 'business' then 999999
    else 5
  end into v_tier_limit
  from users
  where id = p_user_id;

  if v_listing_count >= v_tier_limit then
    raise exception 'Listing limit reached for your current plan';
  end if;

  insert into listings (
    user_id, listing_type, title, description, price,
    board_type, volume, length_inches, width_inches, thickness_inches,
    fin_system, fin_setup, shaper_brand, condition,
    location, location_label, currency, era, is_rideable,
    provenance, lead_time_weeks
  )
  values (
    p_user_id, p_listing_type, p_title, p_description, p_price,
    p_board_type, p_volume, p_length_inches, p_width_inches, p_thickness_inches,
    p_fin_system, p_fin_setup, p_shaper_brand, p_condition,
    ST_MakePoint(p_lng, p_lat)::geography, p_location_label, p_currency,
    p_era, p_is_rideable, p_provenance, p_lead_time_weeks
  )
  returning id into v_listing_id;

  return v_listing_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_inbox(p_user_id uuid)
 RETURNS TABLE(id uuid, last_message text, last_message_at timestamp with time zone, buyer_id uuid, seller_id uuid, listing json, buyer json, seller json)
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
begin
  return query
  select
    t.id,
    t.last_message,
    t.last_message_at,
    t.buyer_id,
    t.seller_id,
    json_build_object(
      'id', l.id,
      'title', l.title,
      'status', l.status,
      'listing_photos', (
        select json_agg(json_build_object(
          'storage_path', lp.storage_path,
          'is_primary', lp.is_primary
        ))
        from listing_photos lp
        where lp.listing_id = l.id
      )
    ) as listing,
    json_build_object(
      'id', buyer.id,
      'full_name', buyer.full_name,
      'avatar_url', buyer.avatar_url
    ) as buyer,
    json_build_object(
      'id', seller.id,
      'full_name', seller.full_name,
      'avatar_url', seller.avatar_url
    ) as seller
  from threads t
  join listings l on l.id = t.listing_id
  join public_users buyer on buyer.id = t.buyer_id
  join public_users seller on seller.id = t.seller_id
  left join blocked_users bu1
    on bu1.blocker_id = p_user_id
    and bu1.blocked_id = t.buyer_id
  left join blocked_users bu2
    on bu2.blocker_id = p_user_id
    and bu2.blocked_id = t.seller_id
  where
    (t.buyer_id = p_user_id or t.seller_id = p_user_id)
    and bu1.blocked_id is null
    and bu2.blocked_id is null
  order by t.last_message_at desc;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_listings_nearby(p_lat double precision, p_lng double precision, p_radius_miles double precision DEFAULT 25, p_volume_min double precision DEFAULT NULL::double precision, p_volume_max double precision DEFAULT NULL::double precision, p_board_type public.board_type DEFAULT NULL::public.board_type, p_fin_system public.fin_system DEFAULT NULL::public.fin_system, p_price_max integer DEFAULT NULL::integer, p_listing_type public.listing_type DEFAULT NULL::public.listing_type, p_length_min double precision DEFAULT NULL::double precision, p_length_max double precision DEFAULT NULL::double precision, p_search_term text DEFAULT NULL::text, p_user_id uuid DEFAULT NULL::uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, title text, price integer, volume numeric, length_inches numeric, board_type public.board_type, fin_system public.fin_system, fin_setup public.fin_setup, primary_photo text, condition public.board_condition, location_label text, is_sponsored boolean, listing_type public.listing_type, user_id uuid, distance_miles double precision, currency text)
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
declare 
  v_point geography := ST_MakePoint(p_lng, p_lat)::geography;
  v_radius_meters double precision := p_radius_miles * 1609.34;
begin
  return query
  select
    l.id,
    l.title,
    l.price,
    l.volume,
    l.length_inches,
    l.board_type,
    l.fin_system,
    l.fin_setup,
    lp.storage_path as primary_photo,
    l.condition,
    l.location_label,
    l.is_sponsored,
    l.listing_type,
    l.user_id,
    ST_Distance(l.location, v_point) / 1609.34 as distance_miles,
    l.currency
  from listings l
  left join listing_photos lp on lp.listing_id = l.id and lp.is_primary = true
  left join blocked_users bu
    on bu.blocker_id = p_user_id
    and bu.blocked_id = l.user_id
  where
    l.status = 'active'
    and ST_DWithin(l.location, v_point, v_radius_meters)
    and (p_volume_min is null or l.volume >= p_volume_min)
    and (p_volume_max is null or l.volume <= p_volume_max)
    and (p_fin_system is null or l.fin_system = p_fin_system)
    and (p_board_type is null or l.board_type = p_board_type)
    and (p_length_min is null or l.length_inches >= p_length_min)
    and (p_length_max is null or l.length_inches <= p_length_max)
    and (p_price_max is null or l.price <= p_price_max)
    and (p_listing_type is null or l.listing_type = p_listing_type)
    and (p_listing_type is not null or l.listing_type != 'vintage')
    and (p_search_term is null or l.title ilike '%' || p_search_term || '%')
    and (p_user_id is null or bu.blocked_id is null)
  order by
    l.is_sponsored desc,
    distance_miles asc
  limit p_limit
  offset p_offset;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.users (id, email, full_name, currency, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'currency' IN ('USD','AUD','GBP','EUR','NZD','ZAR','MXN','BRL')
      THEN NEW.raw_user_meta_data->>'currency'
      ELSE 'USD'
    END,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.message_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
begin
  perform realtime.broadcast_changes(
    'topic:' || NEW.recipient_id::text,
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  return null;
end;
$function$
;

create or replace view "public"."public_users" as  SELECT id,
    full_name,
    avatar_url,
    role,
    location_label,
    created_at,
    is_verified
   FROM public.users
  WHERE (is_banned = false);


CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.send_message(p_sender_id uuid, p_listing_id uuid, p_body text, p_thread_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
declare
  v_thread_id uuid;
  v_recipient_id uuid;
begin
  if auth.uid() != p_sender_id then
    raise exception 'Unauthorized';
  end if;

  -- Check if sender is blocked by recipient
  if p_thread_id is not null then
    select case
      when buyer_id = p_sender_id then seller_id
      else buyer_id
    end into v_recipient_id
    from threads where id = p_thread_id;

    if exists (
      select 1 from blocked_users
      where blocker_id = v_recipient_id
      and blocked_id = p_sender_id
    ) then
      raise exception 'You cannot message this user';
    end if;
  end if;

  if p_thread_id is not null then
    v_thread_id := p_thread_id;
  else
    insert into threads (listing_id, buyer_id, seller_id)
    values (
      p_listing_id,
      p_sender_id,
      (select user_id from listings where id = p_listing_id)
    )
    on conflict (listing_id, buyer_id, seller_id)
    do update set created_at = threads.created_at
    returning id into v_thread_id;
  end if;

  select case
    when buyer_id = p_sender_id then seller_id
    else buyer_id
  end into v_recipient_id
  from threads where id = v_thread_id;

  insert into messages (thread_id, listing_id, sender_id, recipient_id, body)
  values (v_thread_id, p_listing_id, p_sender_id, v_recipient_id, p_body);

  return v_thread_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_business_location(p_user_id uuid, p_lat double precision, p_lng double precision, p_label text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
begin
  update business_profiles set
    location_label = p_label,
    location = st_point(p_lng, p_lat)::geography,
    lat = p_lat,
    lng = p_lng
  where user_id = p_user_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_listing_location(p_listing_id uuid, p_lat double precision, p_lng double precision, p_label text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
begin
  update listings set
    location_label = p_label,
    location = st_point(p_lng, p_lat)::geography
  where id = p_listing_id
  and user_id = auth.uid();
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_thread_last_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
BEGIN
  UPDATE threads
  SET
    last_message = NEW.body,
    last_message_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_location(p_user_id uuid, p_lat double precision, p_lng double precision, p_label text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
BEGIN
  UPDATE users
  SET
    lat = p_lat,
    lng = p_lng,
    location_label = p_label,
    location = ST_MakePoint(p_lng, p_lat)::geography
  WHERE id = p_user_id;
END;
$function$
;

grant delete on table "public"."blocked_users" to "anon";

grant insert on table "public"."blocked_users" to "anon";

grant references on table "public"."blocked_users" to "anon";

grant select on table "public"."blocked_users" to "anon";

grant trigger on table "public"."blocked_users" to "anon";

grant truncate on table "public"."blocked_users" to "anon";

grant update on table "public"."blocked_users" to "anon";

grant delete on table "public"."blocked_users" to "authenticated";

grant insert on table "public"."blocked_users" to "authenticated";

grant references on table "public"."blocked_users" to "authenticated";

grant select on table "public"."blocked_users" to "authenticated";

grant trigger on table "public"."blocked_users" to "authenticated";

grant truncate on table "public"."blocked_users" to "authenticated";

grant update on table "public"."blocked_users" to "authenticated";

grant delete on table "public"."blocked_users" to "service_role";

grant insert on table "public"."blocked_users" to "service_role";

grant references on table "public"."blocked_users" to "service_role";

grant select on table "public"."blocked_users" to "service_role";

grant trigger on table "public"."blocked_users" to "service_role";

grant truncate on table "public"."blocked_users" to "service_role";

grant update on table "public"."blocked_users" to "service_role";

grant delete on table "public"."business_applications" to "anon";

grant insert on table "public"."business_applications" to "anon";

grant references on table "public"."business_applications" to "anon";

grant select on table "public"."business_applications" to "anon";

grant trigger on table "public"."business_applications" to "anon";

grant truncate on table "public"."business_applications" to "anon";

grant update on table "public"."business_applications" to "anon";

grant delete on table "public"."business_applications" to "authenticated";

grant insert on table "public"."business_applications" to "authenticated";

grant references on table "public"."business_applications" to "authenticated";

grant select on table "public"."business_applications" to "authenticated";

grant trigger on table "public"."business_applications" to "authenticated";

grant truncate on table "public"."business_applications" to "authenticated";

grant update on table "public"."business_applications" to "authenticated";

grant delete on table "public"."business_applications" to "service_role";

grant insert on table "public"."business_applications" to "service_role";

grant references on table "public"."business_applications" to "service_role";

grant select on table "public"."business_applications" to "service_role";

grant trigger on table "public"."business_applications" to "service_role";

grant truncate on table "public"."business_applications" to "service_role";

grant update on table "public"."business_applications" to "service_role";

grant delete on table "public"."business_profiles" to "anon";

grant insert on table "public"."business_profiles" to "anon";

grant references on table "public"."business_profiles" to "anon";

grant select on table "public"."business_profiles" to "anon";

grant trigger on table "public"."business_profiles" to "anon";

grant truncate on table "public"."business_profiles" to "anon";

grant update on table "public"."business_profiles" to "anon";

grant delete on table "public"."business_profiles" to "authenticated";

grant insert on table "public"."business_profiles" to "authenticated";

grant references on table "public"."business_profiles" to "authenticated";

grant select on table "public"."business_profiles" to "authenticated";

grant trigger on table "public"."business_profiles" to "authenticated";

grant truncate on table "public"."business_profiles" to "authenticated";

grant update on table "public"."business_profiles" to "authenticated";

grant delete on table "public"."business_profiles" to "service_role";

grant insert on table "public"."business_profiles" to "service_role";

grant references on table "public"."business_profiles" to "service_role";

grant select on table "public"."business_profiles" to "service_role";

grant trigger on table "public"."business_profiles" to "service_role";

grant truncate on table "public"."business_profiles" to "service_role";

grant update on table "public"."business_profiles" to "service_role";

grant delete on table "public"."deletion_requests" to "anon";

grant insert on table "public"."deletion_requests" to "anon";

grant references on table "public"."deletion_requests" to "anon";

grant select on table "public"."deletion_requests" to "anon";

grant trigger on table "public"."deletion_requests" to "anon";

grant truncate on table "public"."deletion_requests" to "anon";

grant update on table "public"."deletion_requests" to "anon";

grant delete on table "public"."deletion_requests" to "authenticated";

grant insert on table "public"."deletion_requests" to "authenticated";

grant references on table "public"."deletion_requests" to "authenticated";

grant select on table "public"."deletion_requests" to "authenticated";

grant trigger on table "public"."deletion_requests" to "authenticated";

grant truncate on table "public"."deletion_requests" to "authenticated";

grant update on table "public"."deletion_requests" to "authenticated";

grant delete on table "public"."deletion_requests" to "service_role";

grant insert on table "public"."deletion_requests" to "service_role";

grant references on table "public"."deletion_requests" to "service_role";

grant select on table "public"."deletion_requests" to "service_role";

grant trigger on table "public"."deletion_requests" to "service_role";

grant truncate on table "public"."deletion_requests" to "service_role";

grant update on table "public"."deletion_requests" to "service_role";

grant delete on table "public"."listing_photos" to "anon";

grant insert on table "public"."listing_photos" to "anon";

grant references on table "public"."listing_photos" to "anon";

grant select on table "public"."listing_photos" to "anon";

grant trigger on table "public"."listing_photos" to "anon";

grant truncate on table "public"."listing_photos" to "anon";

grant update on table "public"."listing_photos" to "anon";

grant delete on table "public"."listing_photos" to "authenticated";

grant insert on table "public"."listing_photos" to "authenticated";

grant references on table "public"."listing_photos" to "authenticated";

grant select on table "public"."listing_photos" to "authenticated";

grant trigger on table "public"."listing_photos" to "authenticated";

grant truncate on table "public"."listing_photos" to "authenticated";

grant update on table "public"."listing_photos" to "authenticated";

grant delete on table "public"."listing_photos" to "service_role";

grant insert on table "public"."listing_photos" to "service_role";

grant references on table "public"."listing_photos" to "service_role";

grant select on table "public"."listing_photos" to "service_role";

grant trigger on table "public"."listing_photos" to "service_role";

grant truncate on table "public"."listing_photos" to "service_role";

grant update on table "public"."listing_photos" to "service_role";

grant delete on table "public"."listings" to "anon";

grant insert on table "public"."listings" to "anon";

grant references on table "public"."listings" to "anon";

grant select on table "public"."listings" to "anon";

grant trigger on table "public"."listings" to "anon";

grant truncate on table "public"."listings" to "anon";

grant update on table "public"."listings" to "anon";

grant delete on table "public"."listings" to "authenticated";

grant insert on table "public"."listings" to "authenticated";

grant references on table "public"."listings" to "authenticated";

grant select on table "public"."listings" to "authenticated";

grant trigger on table "public"."listings" to "authenticated";

grant truncate on table "public"."listings" to "authenticated";

grant update on table "public"."listings" to "authenticated";

grant delete on table "public"."listings" to "service_role";

grant insert on table "public"."listings" to "service_role";

grant references on table "public"."listings" to "service_role";

grant select on table "public"."listings" to "service_role";

grant trigger on table "public"."listings" to "service_role";

grant truncate on table "public"."listings" to "service_role";

grant update on table "public"."listings" to "service_role";

grant delete on table "public"."messages" to "anon";

grant insert on table "public"."messages" to "anon";

grant references on table "public"."messages" to "anon";

grant select on table "public"."messages" to "anon";

grant trigger on table "public"."messages" to "anon";

grant truncate on table "public"."messages" to "anon";

grant update on table "public"."messages" to "anon";

grant delete on table "public"."messages" to "authenticated";

grant insert on table "public"."messages" to "authenticated";

grant references on table "public"."messages" to "authenticated";

grant select on table "public"."messages" to "authenticated";

grant trigger on table "public"."messages" to "authenticated";

grant truncate on table "public"."messages" to "authenticated";

grant update on table "public"."messages" to "authenticated";

grant delete on table "public"."messages" to "service_role";

grant insert on table "public"."messages" to "service_role";

grant references on table "public"."messages" to "service_role";

grant select on table "public"."messages" to "service_role";

grant trigger on table "public"."messages" to "service_role";

grant truncate on table "public"."messages" to "service_role";

grant update on table "public"."messages" to "service_role";

grant delete on table "public"."reports" to "anon";

grant insert on table "public"."reports" to "anon";

grant references on table "public"."reports" to "anon";

grant select on table "public"."reports" to "anon";

grant trigger on table "public"."reports" to "anon";

grant truncate on table "public"."reports" to "anon";

grant update on table "public"."reports" to "anon";

grant delete on table "public"."reports" to "authenticated";

grant insert on table "public"."reports" to "authenticated";

grant references on table "public"."reports" to "authenticated";

grant select on table "public"."reports" to "authenticated";

grant trigger on table "public"."reports" to "authenticated";

grant truncate on table "public"."reports" to "authenticated";

grant update on table "public"."reports" to "authenticated";

grant delete on table "public"."reports" to "service_role";

grant insert on table "public"."reports" to "service_role";

grant references on table "public"."reports" to "service_role";

grant select on table "public"."reports" to "service_role";

grant trigger on table "public"."reports" to "service_role";

grant truncate on table "public"."reports" to "service_role";

grant update on table "public"."reports" to "service_role";

grant delete on table "public"."saved_listings" to "anon";

grant insert on table "public"."saved_listings" to "anon";

grant references on table "public"."saved_listings" to "anon";

grant select on table "public"."saved_listings" to "anon";

grant trigger on table "public"."saved_listings" to "anon";

grant truncate on table "public"."saved_listings" to "anon";

grant update on table "public"."saved_listings" to "anon";

grant delete on table "public"."saved_listings" to "authenticated";

grant insert on table "public"."saved_listings" to "authenticated";

grant references on table "public"."saved_listings" to "authenticated";

grant select on table "public"."saved_listings" to "authenticated";

grant trigger on table "public"."saved_listings" to "authenticated";

grant truncate on table "public"."saved_listings" to "authenticated";

grant update on table "public"."saved_listings" to "authenticated";

grant delete on table "public"."saved_listings" to "service_role";

grant insert on table "public"."saved_listings" to "service_role";

grant references on table "public"."saved_listings" to "service_role";

grant select on table "public"."saved_listings" to "service_role";

grant trigger on table "public"."saved_listings" to "service_role";

grant truncate on table "public"."saved_listings" to "service_role";

grant update on table "public"."saved_listings" to "service_role";

grant delete on table "public"."threads" to "anon";

grant insert on table "public"."threads" to "anon";

grant references on table "public"."threads" to "anon";

grant select on table "public"."threads" to "anon";

grant trigger on table "public"."threads" to "anon";

grant truncate on table "public"."threads" to "anon";

grant update on table "public"."threads" to "anon";

grant delete on table "public"."threads" to "authenticated";

grant insert on table "public"."threads" to "authenticated";

grant references on table "public"."threads" to "authenticated";

grant select on table "public"."threads" to "authenticated";

grant trigger on table "public"."threads" to "authenticated";

grant truncate on table "public"."threads" to "authenticated";

grant update on table "public"."threads" to "authenticated";

grant delete on table "public"."threads" to "service_role";

grant insert on table "public"."threads" to "service_role";

grant references on table "public"."threads" to "service_role";

grant select on table "public"."threads" to "service_role";

grant trigger on table "public"."threads" to "service_role";

grant truncate on table "public"."threads" to "service_role";

grant update on table "public"."threads" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


  create policy "Users can manage their own blocks"
  on "public"."blocked_users"
  as permissive
  for all
  to authenticated
using ((auth.uid() = blocker_id))
with check ((auth.uid() = blocker_id));



  create policy "Users can submit their own application"
  on "public"."business_applications"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));



  create policy "Users can view their own application"
  on "public"."business_applications"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



  create policy "business_profiles_delete_own"
  on "public"."business_profiles"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "business_profiles_insert_own"
  on "public"."business_profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "business_profiles_public_read"
  on "public"."business_profiles"
  as permissive
  for select
  to public
using (true);



  create policy "business_profiles_update_own"
  on "public"."business_profiles"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can submit their own deletion request"
  on "public"."deletion_requests"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));



  create policy "Users can view their own deletion request"
  on "public"."deletion_requests"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



  create policy "photos_delete_own"
  on "public"."listing_photos"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.listings
  WHERE ((listings.id = listing_photos.listing_id) AND (listings.user_id = auth.uid())))));



  create policy "photos_insert_own"
  on "public"."listing_photos"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.listings
  WHERE ((listings.id = listing_photos.listing_id) AND (listings.user_id = auth.uid())))));



  create policy "photos_read_via_listing"
  on "public"."listing_photos"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.listings
  WHERE (listings.id = listing_photos.listing_id))));



  create policy "photos_update_own"
  on "public"."listing_photos"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.listings
  WHERE ((listings.id = listing_photos.listing_id) AND (listings.user_id = auth.uid())))));



  create policy "admin_delete_any_listing"
  on "public"."listings"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::public.user_role)))));



  create policy "admin_read_all_listings"
  on "public"."listings"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::public.user_role)))));



  create policy "admin_update_any_listing"
  on "public"."listings"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::public.user_role)))));



  create policy "listings_authenticated_insert"
  on "public"."listings"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "listings_delete_own"
  on "public"."listings"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "listings_owner_read_own"
  on "public"."listings"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "listings_read_visible_or_participating"
  on "public"."listings"
  as permissive
  for select
  to public
using (((EXISTS ( SELECT 1
   FROM public.public_users
  WHERE (public_users.id = listings.user_id))) AND ((status <> 'deleted'::public.listing_status) OR (EXISTS ( SELECT 1
   FROM public.threads
  WHERE ((threads.listing_id = listings.id) AND ((threads.buyer_id = auth.uid()) OR (threads.seller_id = auth.uid()))))))));



  create policy "listings_update_own"
  on "public"."listings"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "admin_read_all_messages"
  on "public"."messages"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::public.user_role)))));



  create policy "messages_insert_authenticated"
  on "public"."messages"
  as permissive
  for insert
  to public
with check ((auth.uid() = sender_id));



  create policy "messages_read_own"
  on "public"."messages"
  as permissive
  for select
  to public
using (((auth.uid() = sender_id) OR (auth.uid() = recipient_id)));



  create policy "messages_update_recipient"
  on "public"."messages"
  as permissive
  for update
  to public
using ((auth.uid() = recipient_id));



  create policy "Users can submit reports"
  on "public"."reports"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = reporter_id));



  create policy "admin_read_reports"
  on "public"."reports"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::public.user_role)))));



  create policy "saved_delete_own"
  on "public"."saved_listings"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "saved_insert_own"
  on "public"."saved_listings"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "saved_read_own"
  on "public"."saved_listings"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "threads_insert_authenticated"
  on "public"."threads"
  as permissive
  for insert
  to public
with check ((auth.uid() = buyer_id));



  create policy "threads_read_own"
  on "public"."threads"
  as permissive
  for select
  to public
using (((auth.uid() = buyer_id) OR (auth.uid() = seller_id)));



  create policy "users_delete_admin_only"
  on "public"."users"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.users users_1
  WHERE ((users_1.id = auth.uid()) AND (users_1.role = 'admin'::public.user_role)))));



  create policy "users_read_own"
  on "public"."users"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "users_update_own"
  on "public"."users"
  as permissive
  for update
  to public
using ((auth.uid() = id));


CREATE TRIGGER trg_business_profiles_updated_at BEFORE UPDATE ON public.business_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER handle_message_changes AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.message_changes();

CREATE TRIGGER trg_update_thread_last_message AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_thread_last_message();

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Authenticated users can receive broadcasts"
  on "realtime"."messages"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Users can delete their own listing photos"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'listings'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can read their own avatar"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can read their own listing photos"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'listings'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can update their own avatar"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can upload their own avatar"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can upload their own listing photos"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'listings'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



