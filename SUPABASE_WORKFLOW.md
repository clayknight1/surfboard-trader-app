# Supabase Workflow

This doc covers everything you need to know about working with Supabase in this
project: how dev and prod are separated, how schema changes flow, what to do
when something breaks, and the gotchas that aren't in the official docs.

## Quick Reference

| Task                                                  | Command                                           |
| ----------------------------------------------------- | ------------------------------------------------- |
| Switch CLI to dev project                             | `supabase link --project-ref <dev-ref>`           |
| Switch CLI to prod project                            | `supabase link --project-ref <prod-ref>`          |
| See which project CLI is linked to                    | `supabase status`                                 |
| Pull schema from linked project into local migrations | `supabase db pull`                                |
| Push local migrations to linked project               | `supabase db push`                                |
| Show what `db pull` WOULD generate (no write)         | `supabase db diff --linked`                       |
| Create empty migration to write SQL by hand           | `supabase migration new <name>`                   |
| Mark a migration ID as already-applied                | `supabase migration repair --status applied <id>` |

## Project Topology

We have two Supabase projects:

- **Dev** (`<dev-ref>`) — for development. Break things safely here.
- **Prod** (`<prod-ref>`) — what real users hit.

The Expo app picks which to use based on environment file:

- `.env.development` — points to dev project (loaded for `npm start` / dev build)
- `.env.production` — points to prod project (loaded for release / EAS production build)

Required vars per env file:

```
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=<anon/publishable key>
EXPO_PUBLIC_SENTRY_DSN=<dsn>
EXPO_PUBLIC_POSTHOG_KEY=<key>
```

Sentry environment is auto-tagged via `__DEV__` in `app/_layout.tsx`. PostHog is
disabled in dev (`disabled: __DEV__` in PostHogProvider options) so dev usage
doesn't pollute analytics.

## Day-to-Day Workflow: Making a Schema Change

1. **Make the change in dev** via dashboard (SQL editor, Table Editor, RLS
   policies UI, etc.). Don't touch prod directly.
2. **Test it works** in the app (dev build connects to dev project automatically).
3. **Pull the change into local migrations:**
   ```bash
   supabase link --project-ref <dev-ref>   # if not already linked to dev
   supabase db pull
   ```
   Creates a new file: `supabase/migrations/<timestamp>_remote_schema.sql` with
   the diff vs your last migration.
4. **Review the migration file.** Confirm it captured what you expect — no
   unrelated drift, no surprising SECURITY DEFINER changes, no unintended
   permission grants.
5. **Push to prod when ready:**
   ```bash
   supabase link --project-ref <prod-ref>
   supabase db push
   ```
6. **Commit the migration file** to git with a descriptive message.

## CLI Mental Model

The single most useful thing to internalize:

> **The migration files in `supabase/migrations/` are the source of truth for
> your schema.** `db push` syncs the linked project to match the files. `db pull`
> syncs your files to match the linked project. Pick which direction you're
> going each time and remember: `link` decides which project either command
> operates on.

`supabase link` doesn't touch databases — it just configures which project the
CLI talks to for the next command. Think of it like `cd`-ing into a project
context.

## What `db pull` Captures vs. Misses

### Captured ✅

- Public-schema tables, columns, types, constraints, indexes
- RLS policies on any schema table (including `storage.objects`)
- Functions (RPCs), triggers, views
- Triggers on `auth.users` (e.g., `on_auth_user_created`)
- Extensions schema setup

### Missed ❌ — Must recreate manually

- **Storage bucket rows** (`storage.buckets`) — the buckets themselves
- Storage objects — photo bytes (won't migrate, obviously)
- Edge functions — deployed separately via `supabase functions deploy`
- Auth project settings — SMTP, redirect URLs, email confirmation toggle,
  email templates
- Realtime channel config
- Cron jobs (`pg_cron` schedule entries)
- Vault secrets (`supabase.vault`)

## Recreating Dev from Scratch

If dev gets nuked, or you want a clean slate, or you set up staging:

1. Create a new Supabase project in the dashboard.
2. Get its ref from the dashboard URL (`/dashboard/project/<ref>`).
3. Link CLI to it: `supabase link --project-ref <new-ref>`.
4. Apply schema: `supabase db push` (runs all migration files in order).
5. **Manual: recreate storage buckets.** Dashboard → Storage → New bucket:
   - `listings` — public, 5 MB limit, mime types `image/jpeg`, `image/png`,
     `image/webp`
   - `avatars` — public, 5 MB limit, mime types `image/jpeg`, `image/png`,
     `image/webp`

   Before recreating, glance at prod's current bucket config to confirm these
   defaults haven't changed since this doc was written. Storage RLS policies on
   `storage.objects` come from migrations automatically.

6. **Manual: copy auth settings.** Dashboard → Authentication → Settings.
   Match prod's: SMTP credentials, redirect URLs, email confirmation toggle,
   email templates.
7. Update `.env.development` to point at the new project URL + publishable key.
8. **Cold-start the app:** delete from simulator + reinstall via `npm run ios`.
   Old cached session needs to clear; metro reload alone won't do it.

## Deleting Test Users — DO THIS, NOT THAT

### ✅ DO: Delete via Authentication → Users panel

This deletes the `auth.users` row AND cascades through every FK to clean up
`public.users`, listings, messages, etc. Session is invalidated server-side.
Clean.

### ❌ DON'T: Delete via Table Editor → users

This only removes the `public.users` row. The `auth.users` row persists.
Result:

- That email is still "registered" — calling `supabase.auth.signUp()` with the
  same email won't create a new auth row.
- The trigger that populates `public.users` only fires on auth.users INSERT,
  which doesn't happen.
- The user appears signed in but has no profile row.
- Any FK-dependent action (creating a listing, sending a message) fails with
  `Key (user_id)=(...) is not present in table "users"`.

If you've already done this and want to recover: go to Authentication → Users
panel, delete the orphan auth row, then sign up fresh.

## Deleting an Auth User While the App Is Open

The session JWT lives in AsyncStorage on the device and stays valid until
expiry (~1 hour) or manual sign-out. Until then, the app:

- Reads cached session on next start → thinks you're logged in
- Tries to fetch profile → fails (user gone) but `getUserProfile` currently
  swallows the error (returns null)
- Sits on the profile skeleton because the render condition
  `userId && !profile` is permanently true

**Workaround:** delete the app from the simulator + `npm run ios` to reinstall.
This clears AsyncStorage.

(Future fix: code review finding H8 — `getUserProfile` should throw on error,
AuthProvider should sign out on profile fetch failure. Once H8 lands, this
stuck state won't happen.)

## Docker Requirement

Docker Desktop must be running for these commands:

- `supabase db pull`
- `supabase db diff --linked`
- Any command that builds a local schema dump

Docker is NOT needed for:

- `supabase link`
- `supabase db push`
- `supabase migration new`
- `supabase migration repair`

If Docker isn't running, you'll get a friendly error. Start Docker Desktop and
retry. You can quit Docker afterwards — it doesn't need to stay running.

## Email / SMTP

Currently using Supabase's shared SMTP for transactional emails (signup
confirmation, password reset).

**Known issue:** Supabase shared SMTP is aggressive about bounce protection on
new projects. One bounce can trigger a warning email. A few more → emails
disabled for 24 hours.

Before prod launch, switch to a dedicated provider (Resend recommended):

1. Sign up at resend.com, verify your domain (add DNS records).
2. Dashboard → Project Settings → Auth → SMTP Settings → enter Resend
   credentials.
3. Customize email templates in Auth → Email Templates (signup, magic link,
   password reset, etc.).
4. Send test emails before going live.

## Email Confirmation

- **Dev:** OFF. Faster iteration. Toggle: Dashboard → Authentication →
  Providers → Email → "Confirm email" off.
- **Prod:** ON before launch.

## Common Errors and What They Mean

| Error                                                                     | Meaning                                                                                                                                                                                     |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Key (user_id)=(...) is not present in table "users"` on listing creation | `public.users` row missing for an active auth user. Usually caused by manual delete from wrong panel. See "Deleting test users."                                                            |
| `Bucket not found` on photo upload                                        | Storage bucket missing in linked project. Common after recreating dev. Recreate via dashboard.                                                                                              |
| `Request timeout` from Supabase client                                    | The 10s race in `lib/supabase.ts` fired. Network issue or slow query.                                                                                                                       |
| `Failed to verify JWT`                                                    | Session expired or signed user was deleted server-side. App should auto-sign-out; if stuck, reinstall.                                                                                      |
| `infinite recursion detected in policy`                                   | An RLS policy is causing a circular dependency (often a policy queries another table that has its own policy). Refactor with SECURITY DEFINER function or use a view (e.g. `public_users`). |
| `permission denied for schema X`                                          | Function's search_path doesn't include schema X. Common with extensions schema (PostGIS). Set search_path = public, extensions, pg_temp on the function.                                    |
| `policy "X" for table "objects" already exists` (running storage SQL)     | Storage RLS policies come over via `db pull`. Don't re-create them.                                                                                                                         |

## React Query Cache Buster

`app/_layout.tsx` configures a `PersistQueryClientProvider` with a `buster`
string (currently something like `'v8'`). Cached queries from older app
versions are discarded on cold start when the buster changes.

**Bump the buster** when you change a query's data shape incompatibly (e.g.,
add a required field to `ThreadPreview`, restructure a listing payload). If
you forget to bump, users get cached data of the old shape and the UI breaks
until they reinstall.

## Useful Diagnostic SQL

### Check for orphaned auth users (no matching public.users row)

```sql
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL;
```

### Confirm storage buckets and policies match

```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets;

SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
```

### List all RLS policies on a table

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = '<table>';
```

### Check trigger presence on auth.users

```sql
SELECT tgname, tgrelid::regclass::text
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal;
```

### Function security and search_path

```sql
SELECT proname, prosecdef, proconfig
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace;
```

`prosecdef = true` → SECURITY DEFINER (bypasses RLS, must check auth.uid()
internally). `proconfig` shows `search_path` settings.
