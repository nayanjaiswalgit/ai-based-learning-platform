# Notification & Communication Service

Complete notification and communication service for the AI-based learning platform. Handles real-time notifications, emails, push notifications, messaging, and discussion forums.

## Features

### ✅ Real-Time Notifications (Phase 1-2)
- Socket.io server for WebSocket connections
- User-specific notification rooms
- Notification bell UI component with unread badge
- Notification persistence in database
- Mark as read functionality
- 8+ notification types:
  - Course enrollment confirmation
  - New lesson available
  - Code execution complete
  - Daily challenge
  - Bootcamp session reminders
  - Assignment due soon
  - Mentor reply notification
  - Achievement unlocked

### ✅ Email System (Phase 3)
- Resend integration for email delivery
- Customizable email template system (Handlebars)
- Transactional emails:
  - Welcome email
  - Email verification
  - Password reset
  - Payment confirmation
  - Course enrollment
- Marketing emails:
  - Weekly progress summary
  - Course recommendations
  - Bootcamp announcements
- Instructor broadcast emails
- Email preferences (opt-in/opt-out)

### ✅ Push Notifications (Phase 4)
- Firebase Cloud Messaging (FCM) for mobile & web
- Browser push notifications (Web Push API)
- Notification scheduling
- Quiet hours support
- User notification preferences

### ✅ In-App Messaging (Phase 5)
- Direct messaging between users
- Instructor-student messaging
- Group chat for cohorts
- Message threads
- Read receipts
- File attachments
- Message search
- Typing indicators
- Real-time delivery

### ✅ Discussion Forums (Phase 6)
- Forum categories
- Thread creation and replies
- Upvote/downvote system
- Best answer marking
- Thread subscriptions
- Search and tags
- Forum moderation tools:
  - Pin/unpin threads
  - Lock/unlock threads
  - Delete threads/replies
  - Moderation logs
- Community guidelines enforcement

## Tech Stack

- **Framework**: NestJS 10.3.0
- **Database**: PostgreSQL 16.4 with Prisma 6.0.1
- **Real-time**: Socket.io 4.7.2
- **Cache**: Redis 7.4 (ioredis 5.3.2)
- **Email**: Resend 3.0.0
- **Templates**: Handlebars 4.7.8
- **Push**: Firebase Admin SDK 12.0.0, web-push 3.6.7
- **Jobs**: Bull 4.12.0
- **Language**: TypeScript 5.3.3

## Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env

# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# Seed email templates
pnpm prisma db seed
```

## Running the Service

```bash
# Development mode
pnpm run dev

# Production mode
pnpm run build
pnpm run start

# Watch mode (auto-reload)
pnpm run dev
```

## API Endpoints

### Notifications
- `GET /notifications/user/:userId` - Get user notifications
- `GET /notifications/user/:userId/unread-count` - Get unread count
- `PATCH /notifications/:id/read/:userId` - Mark as read
- `PATCH /notifications/mark-all-read/:userId` - Mark all as read
- `DELETE /notifications/:id/:userId` - Delete notification

### Email
- `POST /emails/send` - Send custom email
- `POST /emails/welcome` - Send welcome email
- `POST /emails/verify` - Send verification email
- `POST /emails/password-reset` - Send password reset email
- `GET /emails/preferences/:userId` - Get email preferences
- `PUT /emails/preferences/:userId` - Update email preferences
- `GET /emails/templates` - Get all templates
- `POST /emails/templates` - Create custom template

### Push Notifications
- `POST /push-notifications/subscribe` - Subscribe to push
- `DELETE /push-notifications/unsubscribe/:userId` - Unsubscribe
- `POST /push-notifications/send` - Send push notification

### Messaging
- `GET /messaging/conversations/user/:userId` - Get user conversations
- `GET /messaging/conversations/:id/messages` - Get messages
- `POST /messaging/conversations` - Create conversation
- `POST /messaging/conversations/direct` - Get/create direct conversation
- `POST /messaging/messages` - Send message
- `PUT /messaging/messages/:id` - Edit message
- `DELETE /messaging/messages/:id/:userId` - Delete message
- `POST /messaging/messages/:id/read` - Mark as read
- `GET /messaging/unread-count/:userId` - Get unread count

### Forum
- `GET /forum/categories` - Get all categories
- `POST /forum/categories` - Create category
- `GET /forum/threads` - Get threads
- `GET /forum/threads/search?q=query` - Search threads
- `GET /forum/threads/tag/:tag` - Get threads by tag
- `GET /forum/threads/:id` - Get thread
- `POST /forum/threads` - Create thread
- `DELETE /forum/threads/:id` - Delete thread
- `GET /forum/threads/:id/replies` - Get replies
- `POST /forum/replies` - Create reply
- `POST /forum/threads/:id/vote` - Vote on thread
- `POST /forum/replies/:id/vote` - Vote on reply
- `POST /forum/replies/:id/best-answer` - Mark best answer
- `POST /forum/threads/:id/subscribe` - Subscribe to thread
- `PUT /forum/threads/:id/pin` - Pin thread
- `PUT /forum/threads/:id/lock` - Lock thread
- `GET /forum/moderation/logs` - Get moderation logs

## WebSocket Events

### Notifications Namespace (`/notifications`)
- **Connect**: Join user-specific room
- **Events**:
  - `connected` - Connection confirmed
  - `new-notification` - New notification received
  - `unread-count-updated` - Unread count changed
  - `ping/pong` - Heartbeat

### Messaging Namespace (`/messaging`)
- **Events**:
  - `join-conversation` - Join conversation room
  - `leave-conversation` - Leave conversation room
  - `new-message` - New message in conversation
  - `message-read` - Message read receipt
  - `message-edited` - Message edited
  - `message-deleted` - Message deleted
  - `user-typing` - User is typing
  - `user-stopped-typing` - User stopped typing

## Database Schema

See `prisma/schema.prisma` for complete database schema including:
- Notifications
- Email templates & sent emails
- Email preferences
- Push subscriptions
- Notification preferences
- Conversations & messages
- Message attachments & read receipts
- Forum categories, threads & replies
- Forum votes & subscriptions
- Forum moderation logs

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Service port (default: 3005) | No |
| DATABASE_URL | PostgreSQL connection string | Yes |
| REDIS_URL | Redis connection string | Yes |
| RESEND_API_KEY | Resend API key for emails | Yes |
| FIREBASE_SERVICE_ACCOUNT | Firebase service account JSON | No |
| VAPID_PUBLIC_KEY | VAPID public key for web push | No |
| VAPID_PRIVATE_KEY | VAPID private key for web push | No |
| FRONTEND_URL | Frontend application URL | Yes |

## Generating VAPID Keys

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys

# Add keys to .env file
```

## Scheduled Jobs

- **Every Minute**: Process scheduled notifications
- **Every Sunday 9 AM**: Send weekly progress emails

## Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## Docker

```bash
# Build image
docker build -t notification-service .

# Run container
docker run -p 3005:3005 --env-file .env notification-service
```

## Performance Considerations

- Redis used for caching and session storage
- Database indexes on frequently queried fields
- Connection pooling for database
- Bull queue for email sending (prevents overload)
- Socket.io Redis adapter for horizontal scaling

## Security

- JWT validation on WebSocket connections
- Rate limiting on API endpoints
- Input sanitization and validation
- Secure email template rendering (no XSS)
- File upload validation for message attachments

## Monitoring

- Structured logging with timestamps
- Error tracking integration ready
- Active connection metrics
- Email delivery tracking
- Push notification success rates

## Future Enhancements

- Voice messages in chat
- Video calls integration
- Rich text editor for forums
- Mention system (@username)
- Reaction emojis
- Thread analytics
- Spam detection
- AI-powered content moderation

## License

MIT

## Support

For issues or questions, please contact the development team.
