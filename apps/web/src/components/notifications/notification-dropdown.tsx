'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Bell, CheckCircle2, Code, Trophy, MessageSquare } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const notifications = [
  {
    id: 1,
    type: 'success',
    icon: CheckCircle2,
    title: 'Course Completed',
    message: 'You completed "React Fundamentals"',
    time: '10 minutes ago',
    read: false,
  },
  {
    id: 2,
    type: 'code',
    icon: Code,
    title: 'Problem Solved',
    message: 'You solved "Two Sum" problem',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 3,
    type: 'achievement',
    icon: Trophy,
    title: 'Achievement Unlocked',
    message: 'You earned "7-Day Streak" badge',
    time: '1 day ago',
    read: true,
  },
  {
    id: 4,
    type: 'message',
    icon: MessageSquare,
    title: 'New Reply',
    message: 'Sarah replied to your discussion',
    time: '2 days ago',
    read: true,
  },
]

export function NotificationDropdown() {
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="border-b p-4">
          <h3 className="font-semibold">Notifications</h3>
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex gap-3 border-b p-4 transition-colors hover:bg-accent ${
                !notification.read ? 'bg-primary/5' : ''
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  !notification.read ? 'bg-primary/10' : 'bg-muted'
                }`}
              >
                <notification.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-2">
          <Button variant="ghost" className="w-full">
            View All Notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
