import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="container py-24">
      <div className="mx-auto max-w-4xl rounded-2xl border-2 border-primary bg-primary/5 p-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to Start Learning?
        </h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Join thousands of developers accelerating their careers with AI-powered learning.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/signup">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          No credit card required. Start learning in minutes.
        </p>
      </div>
    </section>
  )
}
