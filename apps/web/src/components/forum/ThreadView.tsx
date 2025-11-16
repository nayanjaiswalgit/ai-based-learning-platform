'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, CheckCircle, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ReplyForm } from './ReplyForm';

interface Reply {
  id: string;
  threadId: string;
  authorId: string;
  content: string;
  isBestAnswer: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    votes: number;
  };
}

interface ThreadViewProps {
  threadId: string;
  currentUserId?: string;
  isThreadAuthor?: boolean;
}

export function ThreadView({ threadId, currentUserId, isThreadAuthor }: ThreadViewProps) {
  const [thread, setThread] = useState<any>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingStates, setVotingStates] = useState<Record<string, 'upvote' | 'downvote' | null>>({});

  useEffect(() => {
    fetchThread();
    fetchReplies();
  }, [threadId]);

  const fetchThread = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/forum/threads/${threadId}`
      );
      const data = await response.json();
      setThread(data);
    } catch (error) {
      console.error('Failed to fetch thread:', error);
    }
  };

  const fetchReplies = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/forum/threads/${threadId}/replies`
      );
      const data = await response.json();
      setReplies(data);
    } catch (error) {
      console.error('Failed to fetch replies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (replyId: string, voteType: 'UPVOTE' | 'DOWNVOTE') => {
    if (!currentUserId) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/forum/replies/${replyId}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUserId,
            voteType,
          }),
        }
      );

      // Update local state
      setVotingStates((prev) => ({
        ...prev,
        [replyId]: prev[replyId] === voteType.toLowerCase() ? null : voteType.toLowerCase() as any,
      }));

      // Refresh replies to get updated vote counts
      fetchReplies();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleMarkBestAnswer = async (replyId: string) => {
    if (!currentUserId || !isThreadAuthor) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/forum/replies/${replyId}/best-answer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            threadId,
            authorId: currentUserId,
          }),
        }
      );

      // Refresh replies
      fetchReplies();
      fetchThread();
    } catch (error) {
      console.error('Failed to mark best answer:', error);
    }
  };

  const handleReplySubmit = () => {
    fetchReplies();
  };

  if (!thread) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Thread Header */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {thread.authorId.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-2xl font-bold">{thread.title}</h1>
              {thread.isSolved && (
                <Badge className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Solved
                </Badge>
              )}
            </div>

            {/* Tags */}
            {thread.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {thread.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Thread Content */}
            <div className="prose prose-sm max-w-none mb-4">
              <p className="whitespace-pre-wrap">{thread.content}</p>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Posted {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
              </span>
              <span>•</span>
              <span>{thread.views} views</span>
              <span>•</span>
              <span>{thread._count?.replies || 0} replies</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : replies.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No replies yet. Be the first to reply!</p>
          </Card>
        ) : (
          replies.map((reply) => (
            <Card
              key={reply.id}
              className={cn(
                'p-6',
                reply.isBestAnswer && 'border-green-600 border-2 bg-green-50 dark:bg-green-950/20'
              )}
            >
              <div className="flex gap-4">
                {/* Vote Controls */}
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(reply.id, 'UPVOTE')}
                    className={cn(
                      votingStates[reply.id] === 'upvote' && 'text-primary'
                    )}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold">{reply._count.votes}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(reply.id, 'DOWNVOTE')}
                    className={cn(
                      votingStates[reply.id] === 'downvote' && 'text-destructive'
                    )}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>

                {/* Reply Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {reply.authorId.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">User {reply.authorId.substring(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {reply.isBestAnswer && (
                        <Badge className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Best Answer
                        </Badge>
                      )}
                      {isThreadAuthor && !reply.isBestAnswer && !thread.isSolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkBestAnswer(reply.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark as Best
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{reply.content}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Reply Form */}
      {currentUserId && !thread.isLocked && (
        <>
          <Separator />
          <ReplyForm
            threadId={threadId}
            userId={currentUserId}
            onSuccess={handleReplySubmit}
          />
        </>
      )}

      {thread.isLocked && (
        <Card className="p-6 text-center text-muted-foreground">
          <p>This thread is locked. No new replies can be added.</p>
        </Card>
      )}
    </div>
  );
}
