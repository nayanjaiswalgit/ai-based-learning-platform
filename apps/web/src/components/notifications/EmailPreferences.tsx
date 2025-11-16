'use client';

import { useState, useEffect } from 'react';
import { Mail, Bell, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

interface EmailPreferencesProps {
  userId: string;
}

interface Preferences {
  marketingEmails: boolean;
  courseUpdates: boolean;
  bootcampNotifications: boolean;
  achievementEmails: boolean;
  weeklyDigest: boolean;
  assignmentReminders: boolean;
  mentorMessages: boolean;
  forumReplies: boolean;
}

export function EmailPreferences({ userId }: EmailPreferencesProps) {
  const [preferences, setPreferences] = useState<Preferences>({
    marketingEmails: true,
    courseUpdates: true,
    bootcampNotifications: true,
    achievementEmails: true,
    weeklyDigest: true,
    assignmentReminders: true,
    mentorMessages: true,
    forumReplies: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/emails/preferences/${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data) {
          setPreferences({
            marketingEmails: data.marketingEmails ?? true,
            courseUpdates: data.courseUpdates ?? true,
            bootcampNotifications: data.bootcampNotifications ?? true,
            achievementEmails: data.achievementEmails ?? true,
            weeklyDigest: data.weeklyDigest ?? true,
            assignmentReminders: data.assignmentReminders ?? true,
            mentorMessages: data.mentorMessages ?? true,
            forumReplies: data.forumReplies ?? true,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch email preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email preferences',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/emails/preferences/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preferences),
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Email preferences saved successfully',
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to save email preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save email preferences',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof Preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <CardTitle>Email Preferences</CardTitle>
        </div>
        <CardDescription>
          Choose which emails you'd like to receive from us
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Learning & Progress */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Learning & Progress</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="courseUpdates" className="text-base cursor-pointer">
                Course Updates
              </Label>
              <p className="text-sm text-muted-foreground">
                Notifications about new lessons and course content
              </p>
            </div>
            <Switch
              id="courseUpdates"
              checked={preferences.courseUpdates}
              onCheckedChange={() => handleToggle('courseUpdates')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="achievementEmails" className="text-base cursor-pointer">
                Achievement Emails
              </Label>
              <p className="text-sm text-muted-foreground">
                Celebrate your achievements and milestones
              </p>
            </div>
            <Switch
              id="achievementEmails"
              checked={preferences.achievementEmails}
              onCheckedChange={() => handleToggle('achievementEmails')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weeklyDigest" className="text-base cursor-pointer">
                Weekly Progress Digest
              </Label>
              <p className="text-sm text-muted-foreground">
                Summary of your learning progress each week
              </p>
            </div>
            <Switch
              id="weeklyDigest"
              checked={preferences.weeklyDigest}
              onCheckedChange={() => handleToggle('weeklyDigest')}
            />
          </div>
        </div>

        <Separator />

        {/* Bootcamps & Events */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Bootcamps & Events</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="bootcampNotifications" className="text-base cursor-pointer">
                Bootcamp Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Session reminders and bootcamp announcements
              </p>
            </div>
            <Switch
              id="bootcampNotifications"
              checked={preferences.bootcampNotifications}
              onCheckedChange={() => handleToggle('bootcampNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="assignmentReminders" className="text-base cursor-pointer">
                Assignment Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Reminders for upcoming assignment deadlines
              </p>
            </div>
            <Switch
              id="assignmentReminders"
              checked={preferences.assignmentReminders}
              onCheckedChange={() => handleToggle('assignmentReminders')}
            />
          </div>
        </div>

        <Separator />

        {/* Communication */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Communication</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mentorMessages" className="text-base cursor-pointer">
                Mentor Messages
              </Label>
              <p className="text-sm text-muted-foreground">
                Messages and replies from your mentors
              </p>
            </div>
            <Switch
              id="mentorMessages"
              checked={preferences.mentorMessages}
              onCheckedChange={() => handleToggle('mentorMessages')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="forumReplies" className="text-base cursor-pointer">
                Forum Replies
              </Label>
              <p className="text-sm text-muted-foreground">
                Replies to your forum threads and discussions
              </p>
            </div>
            <Switch
              id="forumReplies"
              checked={preferences.forumReplies}
              onCheckedChange={() => handleToggle('forumReplies')}
            />
          </div>
        </div>

        <Separator />

        {/* Marketing */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Marketing</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketingEmails" className="text-base cursor-pointer">
                Marketing Emails
              </Label>
              <p className="text-sm text-muted-foreground">
                New course recommendations and platform updates
              </p>
            </div>
            <Switch
              id="marketingEmails"
              checked={preferences.marketingEmails}
              onCheckedChange={() => handleToggle('marketingEmails')}
            />
          </div>
        </div>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
