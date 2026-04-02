# Design Document: Post Engagement Feature

## Overview

The post engagement feature enables users to interact with posts through likes, comments, and nested replies. The feed displays only posts from direct friends in reverse chronological order. All engagement data is persisted to the database and displayed with real-time updates.

## Architecture

### Data Flow

```
User Action (Like/Comment/Reply)
    ↓
UI Component (Button/Form)
    ↓
Service Layer (post-service, engagement-service)
    ↓
Supabase Database
    ↓
Real-time Update
    ↓
UI Re-render
```

### Component Hierarchy

```
HomePage
├── PostList
│   └── PostCard
│       ├── PostHeader
│       ├── PostContent
│       ├── PostMedia
│       ├── PostEngagement
│       │   ├── LikeButton
│       │   ├── CommentButton
│       │   └── ShareButton
│       └── CommentSection
│           ├── CommentList
│           │   └── CommentItem
│           │       ├── CommentHeader
│           │       ├── CommentText
│           │       ├── CommentLikeButton
│           │       ├── ReplyButton
│           │       └── ReplyList
│           │           └── ReplyItem
│           │               ├── ReplyHeader
│           │               ├── ReplyText
│           │               └── ReplyLikeButton
│           └── CommentInput
```

## Components and Interfaces

### Data Models

```typescript
// Post with engagement data
interface PostWithEngagement extends FeedPost {
  likes_count: number
  comments_count: number
  user_liked: boolean
  created_at: string
}

// Comment on a post
interface Comment {
  id: string
  post_id: string
  author_id: string
  author_name: string
  author_username: string
  text: string
  likes_count: number
  replies_count: number
  user_liked: boolean
  created_at: string
}

// Reply to a comment
interface Reply {
  id: string
  comment_id: string
  author_id: string
  author_name: string
  author_username: string
  text: string
  likes_count: number
  user_liked: boolean
  created_at: string
}

// Like record
interface Like {
  id: string
  user_id: string
  post_id?: string
  comment_id?: string
  reply_id?: string
  created_at: string
}
```

### Service Layer

#### post-service.ts (Enhanced)

```typescript
// Fetch feed posts from friends only, ordered by creation date
fetchFriendsFeedPosts(userId: string): Promise<PostWithEngagement[]>

// Fetch comments for a post
fetchPostComments(postId: string, userId: string): Promise<Comment[]>

// Fetch replies for a comment
fetchCommentReplies(commentId: string, userId: string): Promise<Reply[]>

// Create a comment
createComment(postId: string, userId: string, text: string): Promise<Comment>

// Create a reply
createReply(commentId: string, userId: string, text: string): Promise<Reply>

// Delete a comment
deleteComment(commentId: string): Promise<void>

// Delete a reply
deleteReply(replyId: string): Promise<void>
```

#### engagement-service.ts (New)

```typescript
// Like a post
likePost(postId: string, userId: string): Promise<void>

// Unlike a post
unlikePost(postId: string, userId: string): Promise<void>

// Like a comment
likeComment(commentId: string, userId: string): Promise<void>

// Unlike a comment
unlikeComment(commentId: string, userId: string): Promise<void>

// Like a reply
likeReply(replyId: string, userId: string): Promise<void>

// Unlike a reply
unlikeReply(replyId: string, userId: string): Promise<void>

// Check if user liked a post
hasUserLikedPost(postId: string, userId: string): Promise<boolean>

// Check if user liked a comment
hasUserLikedComment(commentId: string, userId: string): Promise<boolean>

// Check if user liked a reply
hasUserLikedReply(replyId: string, userId: string): Promise<boolean>
```

### UI Components

#### PostCard Component

Displays a post with engagement metrics and comment section. Shows like button, comment button, and comment count. Handles comment section expansion/collapse.

#### CommentSection Component

Displays all comments for a post in chronological order. Includes comment input field and comment list. Handles comment creation and deletion.

#### CommentItem Component

Displays a single comment with author info, text, like button, reply button, and nested replies. Shows reply count with "View X replies" link.

#### ReplyItem Component

Displays a single reply with author info, text, and like button. Indented under parent comment.

#### CommentInput Component

Text input field for creating comments or replies. Validates input (non-empty, non-whitespace). Shows character count and submit button.

## Database Schema

### posts table (Enhanced)
- id (uuid, primary key)
- author_id (uuid, foreign key to profiles)
- caption (text)
- visibility (enum: 'friends', 'public')
- created_at (timestamp)
- updated_at (timestamp)

### comments table (New)
- id (uuid, primary key)
- post_id (uuid, foreign key to posts)
- author_id (uuid, foreign key to profiles)
- text (text, not null)
- created_at (timestamp)
- updated_at (timestamp)

### replies table (New)
- id (uuid, primary key)
- comment_id (uuid, foreign key to comments)
- author_id (uuid, foreign key to profiles)
- text (text, not null)
- created_at (timestamp)
- updated_at (timestamp)

### post_likes table (New)
- id (uuid, primary key)
- post_id (uuid, foreign key to posts)
- user_id (uuid, foreign key to profiles)
- created_at (timestamp)
- unique constraint: (post_id, user_id)

### comment_likes table (New)
- id (uuid, primary key)
- comment_id (uuid, foreign key to comments)
- user_id (uuid, foreign key to profiles)
- created_at (timestamp)
- unique constraint: (comment_id, user_id)

### reply_likes table (New)
- id (uuid, primary key)
- reply_id (uuid, foreign key to replies)
- user_id (uuid, foreign key to profiles)
- created_at (timestamp)
- unique constraint: (reply_id, user_id)

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Feed Contains Only Friend Posts

*For any* user and any post in their feed, the post author must be a direct friend of the current user.

**Validates: Requirements 1.1, 1.4**

### Property 2: Feed Ordered Chronologically

*For any* feed, posts must be ordered by creation timestamp in descending order (newest first). If post A appears before post B in the feed, then post A's creation time must be greater than or equal to post B's creation time.

**Validates: Requirements 1.2**

### Property 3: Like Toggle Idempotence

*For any* post and user, liking a post twice followed by unliking once should result in the post being liked. Liking and unliking should be idempotent operations that toggle the like state.

**Validates: Requirements 2.1, 2.2**

### Property 4: Like Count Accuracy

*For any* post, the displayed like count must equal the number of unique users who have liked that post. Adding a like should increment the count by exactly 1, and removing a like should decrement by exactly 1.

**Validates: Requirements 2.5, 2.6**

### Property 5: Comment Persistence Round Trip

*For any* comment created by a user, fetching the post's comments should include that comment with the same text, author, and timestamp.

**Validates: Requirements 3.2, 7.2**

### Property 6: Comment Chronological Order

*For any* post with multiple comments, comments must be ordered by creation timestamp in ascending order (oldest first). If comment A appears before comment B, then comment A's creation time must be less than or equal to comment B's creation time.

**Validates: Requirements 3.4**

### Property 7: Reply Nesting Correctness

*For any* comment with replies, all replies must have the correct parent comment ID, and replies must be displayed only under their parent comment, not under other comments.

**Validates: Requirements 4.2, 4.3**

### Property 8: Comment Deletion Removes All Replies

*For any* comment that is deleted, all replies to that comment must also be removed or hidden from the feed.

**Validates: Requirements 4.6**

### Property 9: Like Count Consistency Across Levels

*For any* post, comment, or reply, the like count displayed must match the number of records in the corresponding likes table for that entity.

**Validates: Requirements 2.5, 5.5, 6.5**

### Property 10: User Can Only Delete Own Comments

*For any* comment, only the user who created it should be able to delete it. Other users should not have delete permissions.

**Validates: Requirements 3.7, 4.6**

## Error Handling

- **Empty comment submission**: Show validation error "Comment cannot be empty"
- **Network failure during like**: Show toast notification and revert UI state
- **Comment fetch failure**: Show "Unable to load comments" message
- **Unauthorized deletion**: Show error "You can only delete your own comments"
- **Database constraint violation**: Handle duplicate like attempts gracefully

## Testing Strategy

### Unit Tests

- Test like/unlike toggle logic
- Test comment creation with validation
- Test reply nesting logic
- Test comment deletion cascading
- Test like count calculations
- Test chronological ordering

### Property-Based Tests

- Property 1: Feed contains only friend posts (generate random users and friendships)
- Property 2: Feed ordered chronologically (generate random posts with timestamps)
- Property 3: Like toggle idempotence (generate random like/unlike sequences)
- Property 4: Like count accuracy (generate random like/unlike operations)
- Property 5: Comment persistence round trip (generate random comments and verify retrieval)
- Property 6: Comment chronological order (generate random comments with timestamps)
- Property 7: Reply nesting correctness (generate random replies and verify parent relationships)
- Property 8: Comment deletion removes replies (generate comments with replies, delete parent)
- Property 9: Like count consistency (generate likes and verify counts match database)
- Property 10: User can only delete own comments (generate comments by different users, verify permissions)

### Integration Tests

- Test complete like workflow (click like, verify count updates, refresh page)
- Test complete comment workflow (create comment, verify display, delete comment)
- Test complete reply workflow (create reply, verify nesting, delete reply)
- Test feed filtering (verify only friend posts appear)
- Test engagement metrics update in real-time

