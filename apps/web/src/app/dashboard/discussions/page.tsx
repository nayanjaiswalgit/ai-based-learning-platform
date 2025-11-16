import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, MessageSquare, ThumbsUp, Eye, Plus } from 'lucide-react'

const discussions = [
  {
    id: 1,
    title: 'How to optimize React performance?',
    author: 'Sarah Williams',
    category: 'React',
    replies: 12,
    views: 245,
    likes: 18,
    time: '2 hours ago',
    answered: true,
  },
  {
    id: 2,
    title: 'Best practices for API design',
    author: 'Mike Johnson',
    category: 'Backend',
    replies: 8,
    views: 156,
    likes: 24,
    time: '5 hours ago',
    answered: true,
  },
  {
    id: 3,
    title: 'Docker vs Kubernetes: When to use what?',
    author: 'Tom Brown',
    category: 'DevOps',
    replies: 15,
    views: 389,
    likes: 32,
    time: '1 day ago',
    answered: false,
  },
  {
    id: 4,
    title: 'Understanding closures in JavaScript',
    author: 'Emma Davis',
    category: 'JavaScript',
    replies: 6,
    views: 123,
    likes: 15,
    time: '2 days ago',
    answered: true,
  },
]

export default function DiscussionsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Discussions</h1>
            <p className="text-muted-foreground">Ask questions and help others</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Discussion
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search discussions..." className="pl-10" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="cursor-pointer">
                  All
                </Badge>
                <Badge variant="outline" className="cursor-pointer">
                  React
                </Badge>
                <Badge variant="outline" className="cursor-pointer">
                  JavaScript
                </Badge>
                <Badge variant="outline" className="cursor-pointer">
                  DevOps
                </Badge>
                <Badge variant="outline" className="cursor-pointer">
                  Backend
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discussions List */}
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <Card key={discussion.id} className="transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">{discussion.likes}</span>
                  </div>

                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
                        {discussion.title}
                      </h3>
                      {discussion.answered && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Answered
                        </Badge>
                      )}
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>by {discussion.author}</span>
                      <Badge variant="outline">{discussion.category}</Badge>
                      <span>{discussion.time}</span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{discussion.replies} replies</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{discussion.views} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
