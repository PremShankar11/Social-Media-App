# Requirements Document: Post Engagement Feature

## Introduction

This feature enables users to interact with posts in their feed through likes, comments, and nested replies. Users can like posts, add comments to posts, reply to comments, and view engagement metrics. The feed displays only posts from direct friends in chronological order (newest first).

## Glossary

- **Post**: A message shared by a user with optional media, visible to their friends
- **Like**: A user's positive reaction to a post or comment
- **Comment**: A text response to a post
- **Reply**: A text response to a comment (nested one level deep)
- **Feed**: The chronological list of posts from the current user's direct friends
- **Engagement**: The collective interactions (likes, comments, replies) on a post
- **Current User**: The authenticated user viewing the feed
- **Friend**: A user who has an accepted friendship connection with the current user

## Requirements

### Requirement 1: Feed Filtering and Ordering

**User Story:** As a user, I want to see only posts from my direct friends in my feed, so that I can stay connected with people I care about.

#### Acceptance Criteria

1. WHEN the user views the home feed THEN the system SHALL display only posts created by users who are direct friends of the current user
2. WHEN posts are displayed THEN the system SHALL order them in reverse chronological order (newest posts first)
3. WHEN a post is created by a friend THEN the system SHALL add it to the feed immediately at the top
4. WHEN the feed loads THEN the system SHALL fetch posts only from confirmed friendships (not pending requests)
5. WHEN a friendship is removed THEN the system SHALL remove that user's posts from the feed

### Requirement 2: Post Likes

**User Story:** As a user, I want to like posts from my friends, so that I can show appreciation for their updates.

#### Acceptance Criteria

1. WHEN a user clicks the like button on a post THEN the system SHALL record the like and increment the like count
2. WHEN a user has already liked a post and clicks the like button again THEN the system SHALL remove the like and decrement the like count
3. WHEN a post is liked THEN the like button SHALL visually indicate that the current user has liked it (filled heart)
4. WHEN a post is unliked THEN the like button SHALL return to its default state (outline heart)
5. WHEN a post is displayed THEN the system SHALL show the total number of likes on that post
6. WHEN multiple users like the same post THEN the system SHALL accurately count all likes

### Requirement 3: Post Comments

**User Story:** As a user, I want to comment on posts from my friends, so that I can engage in conversations about their updates.

#### Acceptance Criteria

1. WHEN a user clicks the comment button on a post THEN the system SHALL display a comment input field
2. WHEN a user types a comment and submits it THEN the system SHALL create the comment and add it to the post
3. WHEN a comment is created THEN the system SHALL display the commenter's name, avatar, timestamp, and comment text
4. WHEN comments exist on a post THEN the system SHALL display them in chronological order (oldest first)
5. WHEN a user views a post THEN the system SHALL show the total number of comments
6. WHEN a comment is added THEN the comment count SHALL increment
7. WHEN a user deletes their own comment THEN the system SHALL remove it and decrement the comment count
8. WHEN a comment is empty or only whitespace THEN the system SHALL prevent submission and show an error

### Requirement 4: Comment Replies

**User Story:** As a user, I want to reply to comments on posts, so that I can have threaded conversations.

#### Acceptance Criteria

1. WHEN a user clicks the reply button on a comment THEN the system SHALL display a reply input field
2. WHEN a user types a reply and submits it THEN the system SHALL create the reply and nest it under the comment
3. WHEN replies exist on a comment THEN the system SHALL display them indented under the parent comment
4. WHEN a reply is created THEN the system SHALL display the replier's name, avatar, timestamp, and reply text
5. WHEN replies exist on a comment THEN the system SHALL show the count of replies
6. WHEN a user deletes their own reply THEN the system SHALL remove it and decrement the reply count
7. WHEN a reply is empty or only whitespace THEN the system SHALL prevent submission and show an error
8. WHEN viewing a post THEN the system SHALL show a "View X replies" link if a comment has replies

### Requirement 5: Comment Likes

**User Story:** As a user, I want to like comments and replies, so that I can show appreciation for specific responses.

#### Acceptance Criteria

1. WHEN a user clicks the like button on a comment THEN the system SHALL record the like and increment the like count
2. WHEN a user has already liked a comment and clicks the like button again THEN the system SHALL remove the like and decrement the like count
3. WHEN a comment is liked THEN the like button SHALL visually indicate that the current user has liked it
4. WHEN a comment is unliked THEN the like button SHALL return to its default state
5. WHEN a comment is displayed THEN the system SHALL show the total number of likes on that comment
6. WHEN a reply is liked THEN the system SHALL apply the same like/unlike behavior as comments

### Requirement 6: Engagement UI Components

**User Story:** As a user, I want to see engagement metrics and interact with posts intuitively, so that I can easily engage with content.

#### Acceptance Criteria

1. WHEN a post is displayed THEN the system SHALL show like count, comment count, and comment button in the engagement section
2. WHEN a comment is displayed THEN the system SHALL show like count and reply button
3. WHEN a reply is displayed THEN the system SHALL show like count
4. WHEN engagement buttons are hovered THEN the system SHALL provide visual feedback (color change or scale)
5. WHEN a post has no comments THEN the system SHALL display "No comments yet" placeholder
6. WHEN a post has comments THEN the system SHALL display them in a collapsible section

### Requirement 7: Data Persistence

**User Story:** As a user, I want my likes, comments, and replies to be saved, so that my engagement is preserved.

#### Acceptance Criteria

1. WHEN a user likes a post THEN the system SHALL persist the like to the database
2. WHEN a user creates a comment THEN the system SHALL persist it to the database with timestamp and author info
3. WHEN a user creates a reply THEN the system SHALL persist it to the database with parent comment reference
4. WHEN the page is refreshed THEN the system SHALL display all previously created likes, comments, and replies
5. WHEN a user deletes engagement THEN the system SHALL remove it from the database

