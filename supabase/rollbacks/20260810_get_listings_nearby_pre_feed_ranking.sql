-- ============================================================
-- ROLLBACK COPY of get_listings_nearby as it existed BEFORE the
-- feed ranking migration. Captured via pg_get_functiondef.
--
-- TO RESTORE:
--   1. DROP the new 17-arg function first (see down migration) —
--      otherwise you end up with two overloads and ambiguous calls.
--   2. Run this file.
--   3. Re-issue the grant:
--      GRANT EXECUTE ON FUNCTION public.get_listings_nearby(
--        double precision, double precision, double precision, double precision,
--        double precision, board_type, fin_system, integer, listing_type,
--        double precision, double precision, text, uuid, integer, integer
--      ) TO authenticated, anon;
--   4. NOTIFY pgrst, 'reload schema';
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_listings_nearby(
  p_lat double precision,
  p_lng double precision,
  p_radius_miles double precision DEFAULT 25,
  p_volume_min double precision DEFAULT NULL::double precision,
  p_volume_max double precision DEFAULT NULL::double precision,
  p_board_type board_type DEFAULT NULL::board_type,
  p_fin_system fin_system DEFAULT NULL::fin_system,
  p_price_max integer DEFAULT NULL::integer,
  p_listing_type listing_type DEFAULT NULL::listing_type,
  p_length_min double precision DEFAULT NULL::double precision,
  p_length_max double precision DEFAULT NULL::double precision,
  p_search_term text DEFAULT NULL::text,
  p_user_id uuid DEFAULT NULL::uuid,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
 RETURNS TABLE(
   id uuid,
   title text,
   price integer,
   volume numeric,
   length_inches numeric,
   board_type board_type,
   fin_system fin_system,
   fin_setup fin_setup,
   primary_photo text,
   condition board_condition,
   location_label text,
   is_sponsored boolean,
   listing_type listing_type,
   user_id uuid,
   distance_miles double precision,
   currency text
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
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