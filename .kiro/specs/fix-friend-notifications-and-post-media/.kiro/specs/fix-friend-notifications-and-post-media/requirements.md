# Requirements Document

## Introduction

This specification addresses two critical bugs in the Circle social application:
1. Friend request notifications persist after acceptance
2. Post media storage and retrieval issues

## Glossary

- **System**: The Circle social application
- **Friend_Request_Service**: The service handling friend request operations
- **Post_Media_Service**: The service handling post media upload and retrieval
- **Notification_Badge**: The UI element displaying pending friend request count
- **Storage_Bucket**: Supabase storage bucket for post media files

## Requirements

### Requirement 1: Friend Request Notification Accuracy

**User Story:** As a user, I want the notification badge to clear when I accept a friend request, so that I only see pending requests that need my attention.

#### Acceptance Criteria

1. WHEN a user accepts a friend request, THE System SHALL update the request status to 'accepted'
2. WHEN calculating the notification count, THE System SHALL only count requests with status 'pending'
3. WHEN a friend request status changes from 'pending' to 'accepted', THE Notification_Badge SHALL decrement by one
4. WHEN there are no pending incoming requests, THE Notification_Badge SHALL display zero or be hidden

### Requirement 2: Post Media Persistence

**User Story:** As a user, I want my post images to be stored permanently, so that they remain visible after page refresh or account switching.

#### Acceptance Criteria

1. WHEN a user creates a post with media, THE Post_Media_Service SHALL upload the file to the Storage_Bucket
2. WHEN media upload succeeds, THE System SHALL create a post_media record with the storage path
3. WHEN fetching posts, THE System SHALL retrieve media URLs from the Storage_Bucket
4. WHEN a user refreshes the page, THE System SHALL display all posts with their associated media
5. IF the Storage_Bucket does not exist, THEN THE System SHALL provide clear error messages indicating storage configuration is needed

### Requirement 3: Storage Bucket Configuration

**User Story:** As a developer, I want clear documentation for setting up the post-media storage bucket, so that media uploads work correctly.

#### Acceptance Criteria

1. THE System SHALL require a storage bucket named 'post-media'
2. THE Storage_Bucket SHALL have appropriate RLS policies for authenticated users
3. THE Storage_Bucket SHALL allow uploads from post authors
4. THE Storage_Bucket SHALL allow reads from friends of post authors
5. WHEN the Storage_Bucket is not configured, THE System SHALL display a helpful error message with setup instructions
