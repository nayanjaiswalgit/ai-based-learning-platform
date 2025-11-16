import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '10 free courses',
      '50 coding problems',
      'Community forum access',
      'Basic progress tracking',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: 29,
    description: 'For serious learners',
    features: [
      'Unlimited courses',
      '1000+ coding problems',
      'AI-powered roadmaps',
      'Code execution in 6+ languages',
      'Priority support',
      'Certificates',
      'Download resources',
      'No ads',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    description: 'For teams and organizations',
    features: [
      'Everything in Pro',
      'Custom branding',
      'SSO/SAML integration',
      'Dedicated account manager',
      'Custom integrations',
      'Analytics dashboard',
      'Team management',
      'Volume licensing',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

const faqs = [
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.',
  },
  {
    question: 'Do you offer a free trial?',
    answer: 'Yes, we offer a 7-day free trial for the Pro plan. No credit card required.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes, you can change your plan at any time. Changes will be reflected in your next billing cycle.',
  },
  {
    question: 'Is there a student discount?',
    answer: 'Yes, we offer a 50% discount for students with a valid student ID.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee if you&apos;re not satisfied with our service.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container py-24">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Choose the plan that&apos;s right for you. All plans include a 30-day money-back guarantee.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto mt-16 grid max-w-6xl gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="px-6">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQs */}
        <div className="mx-auto mt-24 max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mx-auto mt-24 max-w-4xl text-center">
          <Card className="border-2 border-primary bg-primary/5 p-12">
            <h2 className="mb-4 text-3xl font-bold">Still have questions?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Our team is here to help. Contact us for a personalized demo.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg">Schedule a Demo</Button>
              <Button size="lg" variant="outline">
                Contact Sales
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
