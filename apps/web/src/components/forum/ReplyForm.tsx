'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ReplyFormProps {
  threadId: string;
  userId: string;
  replyToId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReplyForm({ threadId, userId, replyToId, onSuccess, onCancel }: ReplyFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forum/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId,
          authorId: userId,
          content,
          replyToId,
        }),
      });

      if (response.ok) {
        setContent('');
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{userId.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="Write your reply..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isSubmitting}
            />

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Use Markdown for formatting
              </p>
              <div className="flex gap-2">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={!content.trim() || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Post Reply
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
}
