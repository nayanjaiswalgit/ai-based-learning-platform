# Integration Examples

Complete examples for integrating the Notification & Communication Service into your application.

## Table of Contents

1. [Real-Time Notifications](#real-time-notifications)
2. [Email Integration](#email-integration)
3. [Push Notifications](#push-notifications)
4. [Messaging System](#messaging-system)
5. [Discussion Forums](#discussion-forums)

---

## Real-Time Notifications

### Backend: Sending Notifications

```typescript
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class NotificationClient {
  constructor(private httpService: HttpService) {}

  async sendNotification(userId: string, type: string, title: string, message: string, data?: any) {
    const url = `${process.env.NOTIFICATION_SERVICE_URL}/notifications/test`;

    await this.httpService.post(url, {
      userId,
      type,
      title,
      message,
      data,
    }).toPromise();
  }

  // Example: Course enrollment notification
  async notifyCourseEnrollment(userId: string, courseTitle: string, courseId: string) {
    await this.sendNotification(
      userId,
      'COURSE_ENROLLMENT',
      'Course Enrollment Successful',
      `You have successfully enrolled in "${courseTitle}"`,
      { courseId, courseTitle }
    );
  }

  // Example: Code execution complete
  async notifyCodeExecutionComplete(userId: string, questionTitle: string, passed: boolean, submissionId: string) {
    await this.sendNotification(
      userId,
      'CODE_EXECUTION_COMPLETE',
      passed ? 'Code Execution Passed! ✅' : 'Code Execution Failed ❌',
      passed
        ? `Your solution for "${questionTitle}" passed all test cases!`
        : `Your solution for "${questionTitle}" failed some test cases.`,
      { questionTitle, passed, submissionId }
    );
  }
}
```

### Frontend: Using the Notification Bell

```tsx
// app/layout.tsx
import { NotificationBell } from '@/components/notifications/NotificationBell';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <header>
          <nav>
            <NotificationBell />
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

### Frontend: Custom Hook Usage

```tsx
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div>
      <h2>Notifications ({unreadCount})</h2>
      {notifications.map((notification) => (
        <div key={notification.id}>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          {!notification.read && (
            <button onClick={() => markAsRead(notification.id)}>Mark as Read</button>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## Email Integration

### Backend: Sending Transactional Emails

```typescript
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class EmailClient {
  constructor(private httpService: HttpService) {}

  async sendWelcomeEmail(userId: string, email: string, userName: string) {
    await this.httpService.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/emails/welcome`,
      {
        userId,
        email,
        userName,
      }
    ).toPromise();
  }

  async sendEmailVerification(userId: string, email: string, verificationToken: string) {
    await this.httpService.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/emails/verify`,
      {
        userId,
        email,
        verificationToken,
      }
    ).toPromise();
  }

  async sendPasswordReset(userId: string, email: string, resetToken: string) {
    await this.httpService.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/emails/password-reset`,
      {
        userId,
        email,
        resetToken,
      }
    ).toPromise();
  }
}
```

### Frontend: Email Preferences Component

```tsx
// app/settings/page.tsx
import { EmailPreferences } from '@/components/notifications/EmailPreferences';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Settings</h1>
      <EmailPreferences userId={user.id} />
    </div>
  );
}
```

---

## Push Notifications

### Frontend: Subscribing to Push Notifications

```typescript
import { subscribeToPushNotifications, requestNotificationPermission } from '@/lib/push-notifications';

// In your component or app initialization
async function setupPushNotifications(userId: string) {
  // Request permission
  const permission = await requestNotificationPermission();

  if (permission === 'granted') {
    // Subscribe to push notifications
    const subscription = await subscribeToPushNotifications(userId);

    if (subscription) {
      console.log('Successfully subscribed to push notifications');
    }
  }
}
```

### Frontend: Service Worker Setup

```tsx
// app/layout.tsx
'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/push-notifications';

export default function RootLayout({ children }) {
  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker();
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### Backend: Sending Push Notifications

```typescript
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class PushNotificationClient {
  constructor(private httpService: HttpService) {}

  async sendPush(userId: string, title: string, body: string, data?: any) {
    await this.httpService.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/push-notifications/send`,
      {
        userId,
        title,
        body,
        data,
      }
    ).toPromise();
  }
}
```

---

## Messaging System

### Frontend: Chat Interface

```tsx
// app/messages/[conversationId]/page.tsx
import { ChatWindow } from '@/components/messaging/ChatWindow';
import { ConversationList } from '@/components/messaging/ConversationList';

export default function MessagesPage({ params }) {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(params.conversationId);
  const [participants, setParticipants] = useState([]);

  return (
    <div className="flex h-screen">
      <div className="w-80">
        <ConversationList
          userId={user.id}
          onSelectConversation={setSelectedConversation}
          selectedConversationId={selectedConversation}
        />
      </div>
      <div className="flex-1">
        {selectedConversation && (
          <ChatWindow
            conversationId={selectedConversation}
            currentUserId={user.id}
            participants={participants}
          />
        )}
      </div>
    </div>
  );
}
```

### Backend: Creating Conversations

```typescript
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class MessagingClient {
  constructor(private httpService: HttpService) {}

  async createDirectConversation(userId1: string, userId2: string) {
    const response = await this.httpService.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/messaging/conversations/direct`,
      {
        userId1,
        userId2,
      }
    ).toPromise();

    return response.data;
  }

  async createGroupChat(createdBy: string, participantIds: string[], name: string) {
    const response = await this.httpService.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/messaging/conversations`,
      {
        createdBy,
        type: 'GROUP',
        participantIds,
        name,
      }
    ).toPromise();

    return response.data;
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const response = await this.httpService.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/messaging/messages`,
      {
        conversationId,
        senderId,
        content,
      }
    ).toPromise();

    return response.data;
  }
}
```

---

## Discussion Forums

### Frontend: Forum Pages

```tsx
// app/forum/page.tsx
import { ThreadList } from '@/components/forum/ThreadList';

export default function ForumPage() {
  return (
    <div>
      <h1>Discussion Forum</h1>
      <ThreadList />
    </div>
  );
}

// app/forum/[category]/[thread]/page.tsx
import { ThreadView } from '@/components/forum/ThreadView';

export default function ThreadPage({ params }) {
  const { user } = useAuth();

  return (
    <ThreadView
      threadId={params.thread}
      currentUserId={user?.id}
      isThreadAuthor={false} // Determine from thread data
    />
  );
}
```

### Backend: Creating Forum Threads

```typescript
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ForumClient {
  constructor(private httpService: HttpService) {}

  async createThread(
    categoryId: string,
    authorId: string,
    title: string,
    content: string,
    tags: string[]
  ) {
    const slug = title.toLowerCase().replace(/\s+/g, '-');

    const response = await this.httpService.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/forum/threads`,
      {
        categoryId,
        authorId,
        title,
        slug,
        content,
        tags,
      }
    ).toPromise();

    return response.data;
  }

  async createReply(threadId: string, authorId: string, content: string) {
    const response = await this.httpService.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/forum/replies`,
      {
        threadId,
        authorId,
        content,
      }
    ).toPromise();

    return response.data;
  }

  async voteThread(threadId: string, userId: string, voteType: 'UPVOTE' | 'DOWNVOTE') {
    const response = await this.httpService.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/forum/threads/${threadId}/vote`,
      {
        userId,
        voteType,
      }
    ).toPromise();

    return response.data;
  }
}
```

---

## Environment Variables

### Backend Service (.env)

```env
# Notification Service
PORT=3005
DATABASE_URL="postgresql://user:password@localhost:5432/learning_platform"
REDIS_URL="redis://localhost:6379"

# Email (Resend)
RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="noreply@platform.com"
EMAIL_FROM_NAME="Learning Platform"

# Firebase Cloud Messaging
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# Web Push (VAPID)
VAPID_PUBLIC_KEY="your_vapid_public_key"
VAPID_PRIVATE_KEY="your_vapid_private_key"

# URLs
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:3005"
NEXT_PUBLIC_NOTIFICATION_SERVICE_URL="http://localhost:3005"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your_vapid_public_key"
```

---

## Complete Integration Example

### 1. User Registration Flow

```typescript
// auth-service/src/auth.service.ts
import { EmailClient } from './clients/email.client';
import { NotificationClient } from './clients/notification.client';

@Injectable()
export class AuthService {
  constructor(
    private emailClient: EmailClient,
    private notificationClient: NotificationClient,
  ) {}

  async register(email: string, password: string, name: string) {
    // Create user
    const user = await this.createUser(email, password, name);

    // Generate verification token
    const verificationToken = this.generateToken();

    // Send welcome email
    await this.emailClient.sendWelcomeEmail(user.id, email, name);

    // Send verification email
    await this.emailClient.sendEmailVerification(user.id, email, verificationToken);

    // Send in-app notification
    await this.notificationClient.sendNotification(
      user.id,
      'WELCOME',
      'Welcome to the Platform!',
      'Start your learning journey today',
    );

    return user;
  }
}
```

### 2. Course Enrollment Flow

```typescript
// course-service/src/enrollment.service.ts
import { EmailClient } from './clients/email.client';
import { NotificationClient } from './clients/notification.client';
import { PushNotificationClient } from './clients/push.client';

@Injectable()
export class EnrollmentService {
  constructor(
    private emailClient: EmailClient,
    private notificationClient: NotificationClient,
    private pushClient: PushNotificationClient,
  ) {}

  async enrollUser(userId: string, courseId: string) {
    // Enroll user in course
    const enrollment = await this.createEnrollment(userId, courseId);
    const course = await this.getCourse(courseId);

    // Send email
    await this.emailClient.sendCourseEnrollment(
      userId,
      user.email,
      course.title,
      courseId,
      course.instructor.name,
    );

    // Send in-app notification
    await this.notificationClient.notifyCourseEnrollment(
      userId,
      course.title,
      courseId,
    );

    // Send push notification
    await this.pushClient.sendPush(
      userId,
      'Course Enrollment Confirmed',
      `You're now enrolled in ${course.title}`,
      { courseId, type: 'course' },
    );

    return enrollment;
  }
}
```

---

## Testing

### Testing Notifications

```bash
# Send test notification
curl -X POST http://localhost:3005/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "type": "TEST",
    "title": "Test Notification",
    "message": "This is a test notification"
  }'
```

### Testing Emails

```bash
# Send test welcome email
curl -X POST http://localhost:3005/emails/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "email": "user@example.com",
    "userName": "John Doe"
  }'
```

### Testing Push Notifications

```bash
# Send test push notification
curl -X POST http://localhost:3005/push-notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "title": "Test Push",
    "body": "This is a test push notification"
  }'
```

---

## Troubleshooting

### WebSocket Connection Issues

```typescript
// Check if Socket.io is connected
if (socket.connected) {
  console.log('✅ Connected to notification server');
} else {
  console.log('❌ Disconnected from notification server');
  // Reconnect
  socket.connect();
}
```

### Push Notification Permission Issues

```typescript
// Check notification permission
const permission = Notification.permission;

if (permission === 'denied') {
  console.error('Notification permission denied');
  // Show UI to user explaining how to enable notifications
}
```

### Email Delivery Issues

- Check RESEND_API_KEY is set correctly
- Verify email addresses are valid
- Check spam folder
- Review sent_emails table for error messages

---

## Best Practices

1. **Always check user preferences** before sending notifications
2. **Use appropriate notification types** for better categorization
3. **Include relevant data** in notification payloads for deep linking
4. **Handle WebSocket disconnections** gracefully with reconnection logic
5. **Rate limit** notification sending to avoid overwhelming users
6. **Test in production** with a small group before rolling out to all users
7. **Monitor delivery rates** and adjust strategies based on metrics
8. **Respect quiet hours** for push notifications
9. **Provide unsubscribe options** for all email types
10. **Use meaningful notification titles and messages**

---

## Support

For questions or issues, please refer to:
- Main README: `services/notification-service/README.md`
- API Documentation: Check the service endpoints
- Database Schema: `services/notification-service/prisma/schema.prisma`
