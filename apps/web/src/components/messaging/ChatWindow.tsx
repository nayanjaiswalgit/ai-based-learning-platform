'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useMessaging } from '@/hooks/useMessaging';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
  isEdited: boolean;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
  }>;
  replyTo?: {
    id: string;
    content: string;
    senderId: string;
  };
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export function ChatWindow({ conversationId, currentUserId, participants }: ChatWindowProps) {
  const {
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    typingUsers,
    startTyping,
    stopTyping,
  } = useMessaging(conversationId, currentUserId);

  const [messageText, setMessageText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    if (editingMessage) {
      await editMessage(editingMessage.id, messageText);
      setEditingMessage(null);
    } else {
      await sendMessage({
        content: messageText,
        replyToId: replyingTo?.id,
      });
      setReplyingTo(null);
    }

    setMessageText('');
    stopTyping();
  };

  const handleTyping = (text: string) => {
    setMessageText(text);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start typing indicator
    startTyping();

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getParticipant = (userId: string) => {
    return participants.find((p) => p.id === userId);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          {participants.length === 1 ? (
            <>
              <Avatar>
                <AvatarImage src={participants[0].avatar} />
                <AvatarFallback>{participants[0].name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{participants[0].name}</h3>
                <p className="text-xs text-muted-foreground">
                  {typingUsers.length > 0 ? 'typing...' : 'online'}
                </p>
              </div>
            </>
          ) : (
            <div>
              <h3 className="font-semibold">
                {participants.map((p) => p.name).join(', ')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {participants.length} participants
              </p>
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => {
            const participant = getParticipant(message.senderId);
            const isOwn = message.senderId === currentUserId;

            return (
              <div
                key={message.id}
                className={cn('flex gap-3', isOwn && 'flex-row-reverse')}
              >
                {!isOwn && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant?.avatar} />
                    <AvatarFallback>{participant?.name[0]}</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    'flex flex-col gap-1 max-w-[70%]',
                    isOwn && 'items-end',
                  )}
                >
                  {!isOwn && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {participant?.name}
                    </span>
                  )}

                  {message.replyTo && (
                    <div className="text-xs bg-muted p-2 rounded border-l-2 border-primary">
                      <span className="font-medium">
                        Replying to {getParticipant(message.replyTo.senderId)?.name}
                      </span>
                      <p className="text-muted-foreground line-clamp-1">
                        {message.replyTo.content}
                      </p>
                    </div>
                  )}

                  <div
                    className={cn(
                      'rounded-lg px-4 py-2 break-words',
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted',
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs underline"
                          >
                            <Paperclip className="h-3 w-3" />
                            {attachment.fileName}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {message.isEdited && <span>(edited)</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {typingUsers.length > 0 && (
            <div className="flex gap-3">
              <div className="flex items-center gap-1 text-muted-foreground">
                <div className="flex gap-1">
                  <span className="animate-bounce delay-0">•</span>
                  <span className="animate-bounce delay-100">•</span>
                  <span className="animate-bounce delay-200">•</span>
                </div>
                <span className="text-xs ml-2">
                  {typingUsers.map((u) => u.name).join(', ')} typing...
                </span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-2 border-t bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">Replying to {getParticipant(replyingTo.senderId)?.name}</span>
              <p className="text-muted-foreground line-clamp-1">{replyingTo.content}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" className="mb-1">
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Input
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              className="resize-none"
            />
          </div>
          <Button variant="ghost" size="icon" className="mb-1">
            <Smile className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="mb-1"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
