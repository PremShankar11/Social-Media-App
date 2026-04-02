# Implementation Plan: Profile Management

## Overview

This plan implements a comprehensive profile management system with collapsible edit section, statistics display, user posts section, and post deletion capability.

## Tasks

- [ ] 1. Create useProfile hook for fetching profile data
  - [ ] 1.1 Create hook file at app/src/hooks/use-profile.ts
    - Fetch current user's profile data
    - Fetch friend count for current user
    - Fetch all posts created by current user
    - Implement refresh function
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 1.2 Implement deletePost function in hook
    - Call post service to delete post
    - Update local posts state
    - Handle errors gracefully
    - _Requirements: 4.3, 4.4_

- [ ] 2. Create ProfileStats component
  - [ ] 2.1 Create component file at app/src/features/profile/profile-stats.tsx
    - Display friend count
    - Display post count
    - Style with consistent design
    - _Requirements: 2.1, 2.2_
  
  - [ ]* 2.2 Write property test for stats display
    - **Property 2: Statistics accuracy after operations**
    - **Validates: Requirements 2.3, 2.4, 2.5**
    - Generate random friend and post counts
    - Verify display matches input values
    - _Requirements: 2.1, 2.2_

- [ ] 3. Create EditProfileToggle component
  - [ ] 3.1 Create component file at app/src/features/profile/edit-profile-toggle.tsx
    - Manage toggle state (visible/hidden)
    - Display toggle button with dynamic text
    - Pass visibility state to parent
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 3.2 Write property test for toggle behavior
    - **Property 1: Edit section toggle state consistency**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
    - Generate random toggle sequences
    - Verify state alternates correctly
    - Verify button text matches state
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [ ] 4. Create UserPostsSection component
  - [ ] 4.1 Create component file at app/src/features/profile/user-posts-section.tsx
    - Display all user posts
    - Show empty state when no posts
    - Order posts by creation date descending
    - Add delete button to each post
    - _Requirements: 3.1, 3.2, 3.3, 4.1_
  
  - [ ] 4.2 Implement delete confirmation dialog
    - Show confirmation before deletion
    - Handle user confirmation/cancellation
    - Show loading state during deletion
    - _Requirements: 4.2_
  
  - [ ]* 4.3 Write property test for posts list
    - **Property 3: User posts list consistency**
    - **Validates: Requirements 3.1, 3.3, 3.4, 3.5, 4.4**
    - Generate random posts with various dates
    - Verify ordering is correct
    - Verify deletion removes posts
    - _Requirements: 3.1, 3.3, 3.4, 3.5_

- [ ] 5. Update ProfilePage component
  - [ ] 5.1 Integrate useProfile hook
    - Call hook with current user ID
    - Handle loading and error states
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 5.2 Add ProfileStats component
    - Pass friend count and post count
    - Position in profile header area
    - _Requirements: 2.1, 2.2_
  
  - [ ] 5.3 Add EditProfileToggle component
    - Manage edit section visibility
    - Conditionally render ProfileSetupForm
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 5.4 Add UserPostsSection component
    - Pass user posts and delete handler
    - Position below edit section
    - _Requirements: 3.1, 3.2, 3.3, 4.1_

- [ ] 6. Update post-service.ts for deletion
  - [ ] 6.1 Add deletePost function
    - Delete post from database
    - Delete associated post_media records
    - Handle cascade deletion
    - _Requirements: 4.3, 4.4_
  
  - [ ] 6.2 Add getUserPosts function
    - Fetch all posts for a user
    - Include media information
    - Order by creation date descending
    - _Requirements: 3.1, 3.3_

- [ ] 7. Checkpoint - Verify profile management works
  - Manually test edit section toggle
  - Manually test statistics display
  - Manually test post creation and count update
  - Manually test post deletion
  - Ensure all tests pass
  - Ask the user if questions arise

- [ ] 8. Add real-time updates
  - [ ] 8.1 Implement post count update on post creation
    - Hook into feed creation flow
    - Trigger profile refresh
    - _Requirements: 2.4, 5.5_
  
  - [ ] 8.2 Implement friend count update on friendship
    - Hook into friend request acceptance
    - Trigger profile refresh
    - _Requirements: 2.3, 5.4_

- [ ] 9. Final checkpoint - All features working
  - Verify all statistics update in real-time
  - Verify posts appear/disappear correctly
  - Verify edit section toggle works smoothly
  - Verify page refresh maintains data consistency
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The profile page should be responsive and work on mobile
- Use existing design patterns from other components
- Ensure error messages are user-friendly
- Property tests should run minimum 100 iterations
