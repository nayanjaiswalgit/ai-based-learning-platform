'use client';

import { useState, useEffect } from 'react';
import { Search, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  type: string;
  name?: string;
  participants: Array<{
    userId: string;
    name?: string;
    avatar?: string;
  }>;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
  };
  unreadCount: number;
  lastMessageAt?: Date;
}

interface ConversationListProps {
  userId: string;
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

export function ConversationList({
  userId,
  onSelectConversation,
  selectedConversationId,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, [userId]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messaging/conversations/user/${userId}`
      );
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    if (conv.name?.toLowerCase().includes(searchLower)) return true;

    const participantNames = conv.participants
      .map((p) => p.name?.toLowerCase())
      .join(' ');
    return participantNames.includes(searchLower);
  });

  const getConversationName = (conversation: Conversation) => {
    if (conversation.name) return conversation.name;

    // For direct messages, show other participant's name
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== userId
    );
    return otherParticipant?.name || 'Unknown';
  };

  const getConversationAvatar = (conversation: Conversation) => {
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== userId
    );
    return otherParticipant?.avatar;
  };

  return (
    <div className="flex flex-col h-full border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Messages</h2>
          <Button size="icon" variant="ghost">
            <MessageSquarePlus className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <MessageSquarePlus className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={cn(
                  'w-full p-4 flex gap-3 hover:bg-muted/50 transition-colors text-left',
                  selectedConversationId === conversation.id && 'bg-muted'
                )}
              >
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={getConversationAvatar(conversation)} />
                  <AvatarFallback>
                    {getConversationName(conversation)[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold truncate">
                      {getConversationName(conversation)}
                    </h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(
                          new Date(conversation.lastMessage.createdAt),
                          { addSuffix: true }
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="default" className="flex-shrink-0">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
