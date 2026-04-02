# Supabase Setup Notes

## What needs to be run in Supabase

To make the current app features work, run these SQL files in your Supabase SQL editor in this order:

1. `supabase/migrations/20260402_initial_schema.sql`
2. `supabase/migrations/20260402_rls_and_triggers.sql`

## Why this matters

The frontend now includes:
- sign up and sign in
- profile creation and update
- user search
- friend request sending
- friend request acceptance and rejection
- accepted friends listing

These features depend on the tables and RLS policies defined in the migration files.

## Current project credentials

The local frontend environment is already connected through `app/.env`.

## Next likely step after SQL setup

After the migrations are applied, the next feature in the plan should be:
- posting with text/image/video metadata
- media upload flow
- feed query for friends-only chronological posts
