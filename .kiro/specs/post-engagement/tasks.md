# Implementation Plan: Post Engagement Feature

## Overview

This plan breaks down the post engagement feature into discrete, manageable tasks. Each task builds on previous ones, with testing integrated throughout to catch issues early.

## Tasks

- [ ] 1. Set up database schema and migrations
  - Create comments, replies, post_likes, comment_likes, reply_likes tables
  - Add foreign key constraints and indexes
  - Set up RLS policies for engagement tables
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 2. Create engagement service layer
  - [ ] 2.1 Implement engagement-service.ts with like/unlike functions
    - Write functions for liking/unliking posts, comments, and replies
    - Implement hasUserLiked functions for all three types
    - _Requirements: 2.1, 2.2, 5.1, 5.2_

  - [ ]* 2.2 Write property tests for like toggle idempotence
    - **Property 3: Like toggle idempotence**
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 2.3 Write property tests for like count accuracy
    - **Property 4: Like count accuracy**
    - **Validates: Requirements 2.5, 2.6**

- [ ] 3. Enhance post-service for feed filtering
  - [ ] 3.1 Implement fetchFriendsFeedPosts function
    - Query posts only from direct friends
    - Order by creation date descending (newest first)
    - Include like count and user's like status
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ]* 3.2 Write property tests for feed filtering
    - **Property 1: Feed contains only friend posts**
    - **Validates: Requirements 1.1, 1.4**

  - [ ]* 3.3 Write property tests for chronological ordering
    - **Property 2: Feed ordered chronologically**
    - **Validates: Requirements 1.2**

- [ ] 4. Implement comment service functions
  - [ ] 4.1 Add comment CRUD functions to post-service
    - createComment, fetchPostComments, deleteComment
    - Include author info and timestamps
    - _Requirements: 3.2, 3.3, 3.7_

  - [ ]* 4.2 Write property tests for comment persistence
    - **Property 5: Comment persistence round trip**
    - **Validates: Requirements 3.2, 7.2**

  - [ ]* 4.3 Write property tests for comment ordering
    - **Property 6: Comment chronological order**
    - **Validates: Requirements 3.4**

- [ ] 5. Implement reply service functions
  - [ ] 5.1 Add reply CRUD functions to post-service
    - createReply, fetchCommentReplies, deleteReply
    - Include parent comment reference
    - _Requirements: 4.2, 4.3, 4.6_

  - [ ]* 5.2 Write property tests for reply nesting
    - **Property 7: Reply nesting correctness**
    - **Validates: Requirements 4.2, 4.3**

  - [ ]* 5.3 Write property tests for cascade deletion
    - **Property 8: Comment deletion removes all replies**
    - **Validates: Requirements 4.6**

- [ ] 6. Update useFeed hook for new feed behavior
  - [ ] 6.1 Modify useFeed to use fetchFriendsFeedPosts
    - Replace current feed fetching with friend-only posts
    - Maintain chronological ordering
    - _Requirements: 1.1, 1.2_

  - [ ] 6.2 Add engagement state to useFeed
    - Track likes, comments, and replies
    - Handle real-time updates
    - _Requirements: 2.1, 3.2, 4.2_

- [ ] 7. Create PostCard component enhancements
  - [ ] 7.1 Add engagement metrics display
    - Show like count, comment count
    - Display like and comment buttons
    - _Requirements: 6.1, 6.2_

  - [ ] 7.2 Implement like button with toggle
    - Visual feedback for liked state (filled vs outline heart)
    - Call engagement service on click
    - _Requirements: 2.3, 2.4_

  - [ ] 7.3 Add comment section toggle
    - Show/hide comments with collapsible section
    - Display "No comments yet" when empty
    - _Requirements: 6.6_

- [ ] 8. Create CommentSection component
  - [ ] 8.1 Build comment list display
    - Render comments in chronological order
    - Show author, timestamp, and text
    - _Requirements: 3.3, 3.4_

  - [ ] 8.2 Create CommentInput component
    - Text input with validation (non-empty, non-whitespace)
    - Submit button and character count
    - _Requirements: 3.8_

  - [ ] 8.3 Implement comment creation flow
    - Call createComment service on submit
    - Update UI optimistically
    - _Requirements: 3.2, 3.5_

  - [ ] 8.4 Add comment deletion
    - Delete button for own comments only
    - Confirm before deletion
    - _Requirements: 3.7_

- [ ] 9. Create CommentItem component
  - [ ] 9.1 Build comment display
    - Show author avatar, name, timestamp
    - Display comment text
    - _Requirements: 3.3_

  - [ ] 9.2 Add like button to comments
    - Toggle like state
    - Show like count
    - _Requirements: 5.1, 5.2, 5.5_

  - [ ] 9.3 Add reply button and count
    - Show "View X replies" link
    - Toggle reply section visibility
    - _Requirements: 4.8_

- [ ] 10. Create ReplySection component
  - [ ] 10.1 Build reply list display
    - Render replies indented under parent comment
    - Show author, timestamp, and text
    - _Requirements: 4.3_

  - [ ] 10.2 Create ReplyInput component
    - Text input with validation
    - Submit button
    - _Requirements: 4.2_

  - [ ] 10.3 Implement reply creation flow
    - Call createReply service on submit
    - Update UI optimistically
    - _Requirements: 4.2_

  - [ ] 10.4 Add reply deletion
    - Delete button for own replies only
    - _Requirements: 4.6_

- [ ] 11. Create ReplyItem component
  - [ ] 11.1 Build reply display
    - Show author avatar, name, timestamp
    - Display reply text with indentation
    - _Requirements: 4.3_

  - [ ] 11.2 Add like button to replies
    - Toggle like state
    - Show like count
    - _Requirements: 5.1, 5.2, 5.5_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all unit tests pass
  - Ensure all property tests pass
  - Verify no console errors

- [ ] 13. Integration testing
  - [ ] 13.1 Test complete like workflow
    - Click like button, verify count updates
    - Refresh page, verify like persists
    - _Requirements: 2.1, 2.3, 7.1_

  - [ ] 13.2 Test complete comment workflow
    - Create comment, verify display
    - Delete comment, verify removal
    - _Requirements: 3.2, 3.7, 7.2_

  - [ ] 13.3 Test complete reply workflow
    - Create reply, verify nesting
    - Delete reply, verify removal
    - _Requirements: 4.2, 4.6_

  - [ ] 13.4 Test feed filtering
    - Verify only friend posts appear
    - Verify chronological ordering
    - _Requirements: 1.1, 1.2_

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Ensure all integration tests pass
  - Verify engagement metrics are accurate
  - Test on multiple browsers/devices

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end workflows

