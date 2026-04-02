# Implementation Plan: Fix Friend Notifications and Post Media

## Overview

This plan addresses two bugs: friend request notification badge not clearing and post media not persisting. The implementation focuses on debugging the existing code, adding storage bucket configuration, and ensuring proper state updates.

## Tasks

- [ ] 1. Investigate and fix friend request notification badge
  - [ ] 1.1 Add debugging to friend request acceptance flow
    - Add console logging to track status updates in `respondToFriendRequest`
    - Log the requests array before and after `refresh()` call
    - Verify the status is actually changing to 'accepted' in the database
    - _Requirements: 1.1, 1.2_
  
  - [ ] 1.2 Fix any race conditions in state updates
    - Ensure `refresh()` completes before state updates
    - Verify `incomingPendingCount` recalculates after requests state changes
    - Add error handling for failed status updates
    - _Requirements: 1.1, 1.3_
  
  - [ ]* 1.3 Write property test for pending count calculation
    - **Property 1: Pending count only includes pending incoming requests**
    - **Validates: Requirements 1.2, 1.3**
    - Generate random sets of friend requests with various statuses
    - Verify count only includes status='pending' AND direction='incoming'
    - _Requirements: 1.2, 1.3_

- [ ] 2. Set up Supabase storage bucket for post media
  - [ ] 2.1 Create storage bucket migration
    - Create new migration file for storage bucket setup
    - Add SQL to create 'post-media' bucket if not exists
    - Configure bucket as private with RLS enabled
    - _Requirements: 3.1, 3.2_
  
  - [ ] 2.2 Add storage bucket RLS policies
    - Allow authenticated users to upload to their own post folders
    - Allow users to read media from posts they can access (own posts + friends' posts)
    - Test policies with different user scenarios
    - _Requirements: 3.3, 3.4_
  
  - [ ] 2.3 Create setup documentation
    - Document how to apply the storage migration
    - Add troubleshooting steps for common storage issues
    - Include instructions for verifying bucket configuration
    - _Requirements: 3.5_

- [ ] 3. Improve error handling for post media
  - [ ] 3.1 Add better error messages for storage failures
    - Catch storage bucket not found errors
    - Display user-friendly message with setup instructions
    - Log detailed error information for debugging
    - _Requirements: 2.5, 3.5_
  
  - [ ]* 3.2 Write property test for post media persistence
    - **Property 3: Post media round-trip persistence**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
    - Create test posts with random media files
    - Verify media persists after upload and fetch
    - Test with different media types (image, video)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 4. Checkpoint - Verify fixes work end-to-end
  - Manually test friend request acceptance and badge update
  - Manually test post creation with media and page refresh
  - Ensure all tests pass
  - Ask the user if questions arise

- [ ] 5. Add integration tests for complete flows
  - [ ]* 5.1 Write integration test for friend request flow
    - Test sending, accepting, and verifying friendship creation
    - Verify notification count updates correctly
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ]* 5.2 Write integration test for post media flow
    - Test creating post with media, uploading, and fetching
    - Verify media URLs are accessible
    - Test with page refresh simulation
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The friend request issue is likely a state update timing problem, not a logic error
- The post media issue is likely a missing storage bucket configuration
- Storage bucket setup requires Supabase CLI or dashboard access
- Property tests should run minimum 100 iterations for thorough coverage
