'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Eye, Pin, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Thread {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  isPinned: boolean;
  isLocked: boolean;
  isSolved: boolean;
  views: number;
  tags: string[];
  createdAt: Date;
  lastReplyAt?: Date;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    replies: number;
    votes: number;
  };
}

interface ThreadListProps {
  categoryId?: string;
  searchQuery?: string;
  tag?: string;
}

export function ThreadList({ categoryId, searchQuery, tag }: ThreadListProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThreads();
  }, [categoryId, searchQuery, tag]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/forum/threads`;

      if (categoryId) {
        url += `?categoryId=${categoryId}`;
      } else if (searchQuery) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/forum/threads/search?q=${searchQuery}`;
      } else if (tag) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/forum/threads/tag/${tag}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setThreads(data);
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No threads found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => (
        <Card key={thread.id} className="p-4 hover:shadow-md transition-shadow">
          <Link href={`/forum/${thread.category.slug}/${thread.slug}`}>
            <div className="flex gap-4">
              {/* Author Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {thread.authorId.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Thread Content */}
              <div className="flex-1 min-w-0">
                {/* Title and Status Icons */}
                <div className="flex items-start gap-2 mb-2">
                  {thread.isPinned && (
                    <Pin className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                  )}
                  {thread.isLocked && (
                    <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  )}
                  {thread.isSolved && (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                  )}

                  <h3
                    className={cn(
                      'font-semibold text-lg hover:text-primary transition-colors',
                      thread.isPinned && 'text-primary'
                    )}
                  >
                    {thread.title}
                  </h3>
                </div>

                {/* Content Preview */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {thread.content}
                </p>

                {/* Tags */}
                {thread.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {thread.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {thread._count.replies} replies
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {thread._count.votes} votes
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {thread.views} views
                  </span>
                  <span>
                    {thread.lastReplyAt
                      ? `Last reply ${formatDistanceToNow(new Date(thread.lastReplyAt), {
                          addSuffix: true,
                        })}`
                      : `Created ${formatDistanceToNow(new Date(thread.createdAt), {
                          addSuffix: true,
                        })}`}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  );
}
