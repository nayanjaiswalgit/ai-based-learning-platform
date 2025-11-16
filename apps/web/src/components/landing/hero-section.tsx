import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="container relative py-24 md:py-32">
      <div className="mx-auto max-w-5xl text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Personalized Learning</span>
        </div>

        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Master Tech Skills with{' '}
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            AI-Powered
          </span>{' '}
          Learning
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Get personalized roadmaps, interactive coding challenges, live bootcamps, and AI
          mentorship. Learn faster and smarter with adaptive learning paths tailored just for you.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/courses">Explore Courses</Link>
          </Button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div>
            <span className="text-2xl font-bold text-foreground">10,000+</span>
            <p>Active Learners</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div>
            <span className="text-2xl font-bold text-foreground">500+</span>
            <p>Courses</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div>
            <span className="text-2xl font-bold text-foreground">95%</span>
            <p>Success Rate</p>
          </div>
        </div>
      </div>
    </section>
  )
}
