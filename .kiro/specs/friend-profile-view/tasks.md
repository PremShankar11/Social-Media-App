# Implementation Plan: Friend Profile View

## Overview

This plan implements a friend profile view feature that displays a friend's profile, posts, and statistics in a read-only format. Users can navigate to friend profiles from the connections page and view their activity without being able to edit or delete their content.

## Tasks

- [ ] 1. Create useFriendProfile hook
  - [ ] 1.1 Create hook file at app/src/hooks/use-friend-profile.ts
    - Fetch friend profile data by friend ID
    - Fetch friend's posts
    - Calculate friend's friend count
    - Calculate friend's post count
    - Implement refresh function
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 1.2 Add error handling for invalid friend
    - Check if friend still exists
    - Check if users are still friends
    - Return appropriate error messages
    - _Requirements: 7.5_

- [ ] 2. Create FriendProfilePage component
  - [ ] 2.1 Create component file at app/src/features/profile/friend-profile-page.tsx
    - Accept friendId as prop or from route
    - Call useFriendProfile hook
    - Render profile header, stats, and posts
    - Display back button
    - _Requirements: 1.3, 1.4, 1.5, 2.5_
  
  - [ ] 2.2 Implement back button navigation
    - Navigate back to previous view
    - Handle navigation state
    - _Requirements: 6.1, 6.2_

- [ ] 3. Create FriendProfileHeader component
  - [ ] 3.1 Create component file at app/src/features/profile/friend-profile-header.tsx
    - Display friend's avatar/initial
    - Display friend's display name
    - Display friend's username
    - Display friend's bio if available
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 4. Create FriendProfileStats component
  - [ ] 4.1 Create component file at app/src/features/profile/friend-profile-stats.tsx
    - Display friend's friend count
    - Display friend's post count
    - Ensure read-only display
    - _Requirements: 4.1, 4.2, 4.4_

- [ ] 5. Create FriendPostsSection component
  - [ ] 5.1 Create component file at app/src/features/profile/friend-posts-section.tsx
    - Display all friend's posts
    - Order posts by creation date descending
    - Show empty state when no posts
    - Ensure NO delete buttons on posts
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6. Update FriendsPanel to enable friend profile navigation
  - [ ] 6.1 Make friend items clickable
    - Add click handler to friend rows
    - Navigate to friend profile view
    - Pass friend ID to new view
    - _Requirements: 1.1, 1.2_
  
  - [ ] 6.2 Update navigation routing
    - Add route for friend profile view
    - Handle route parameters
    - _Requirements: 1.2, 6.3, 6.4_

- [ ] 7. Add friend profile service functions
  - [ ] 7.1 Add getFriendProfile function to friends-service.ts
    - Fetch friend profile data
    - Verify friendship exists
    - _Requirements: 7.1_
  
  - [ ] 7.2 Add getFriendPosts function to post-service.ts
    - Fetch posts for a specific friend
    - Order by creation date descending
    - _Requirements: 7.2_
  
  - [ ] 7.3 Add getFriendCount function to friends-service.ts
    - Count total friends for a user
    - _Requirements: 7.3_

- [ ] 8. Checkpoint - Verify friend profile view works
  - Navigate to connections page
  - Click on a friend
  - Verify friend profile loads correctly
  - Verify no edit or delete buttons appear
  - Verify back button works
  - Verify statistics display correctly
  - Ask the user if questions arise

- [ ] 9. Add read-only enforcement
  - [ ] 9.1 Ensure edit controls are not rendered
    - Conditionally hide edit section
    - Hide edit button
    - _Requirements: 5.1, 5.2_
  
  - [ ] 9.2 Ensure delete controls are not rendered
    - Remove delete buttons from posts
    - Prevent delete operations
    - _Requirements: 3.4, 3.5, 5.3, 5.4_

- [ ] 10. Add navigation between friend profiles
  - [ ] 10.1 Allow clicking on other friends from friend profile
    - Add friend links in friend profile
    - Navigate to other friend profiles
    - Load new friend data
    - _Requirements: 6.3, 6.4_
  
  - [ ] 10.2 Implement state cleanup on navigation
    - Clear previous friend data
    - Reset scroll position
    - _Requirements: 6.5_

- [ ] 11. Final checkpoint - All features working
  - Test full friend profile flow
  - Test navigation between multiple friends
  - Test back button from various states
  - Test with friends who have no posts
  - Test with friends who have many posts
  - Verify all read-only constraints work
  - Ask the user if questions arise

## Notes

- Friend profile view should mirror user profile view but without edit/delete capabilities
- Reuse components from profile management where possible
- Ensure proper error handling for invalid friend IDs
- Test navigation state management carefully
- Consider mobile responsiveness
- Maintain consistent styling with existing profile view
