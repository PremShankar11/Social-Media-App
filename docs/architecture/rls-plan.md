# RLS Plan

## Principles

- access control must be enforced in the database
- the client is not trusted for authorization
- new features must define read/write rules before implementation

## Initial policy targets

### `profiles`
- users can read profiles of accepted friends and their own profile
- users can update only their own profile

### `friend_requests`
- users can create requests where `sender_id = auth.uid()`
- users can view requests they sent or received
- only receiver can accept or reject an incoming request

### `friendships`
- users can read friendship rows that include them
- friendship rows should be created through controlled server/database logic

### `posts`
- users can create posts where `author_id = auth.uid()`
- users can read their own posts
- users can read posts from accepted friends only

### `post_media`
- users can read media attached to posts they are allowed to read
- users can create media rows only for their own posts

### `notifications`
- users can read and update only their own notifications

## Open implementation note

For feed queries, we may use SQL views or Supabase Edge Functions where policy-only querying becomes too complex.
