'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Clock, ArrowRight, Users, Rocket, Heart, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CareersPage() {
  const openings = [
    {
      title: 'Senior Full Stack Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Help us build the future of online education with cutting-edge technology.',
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote / San Francisco',
      type: 'Full-time',
      description: 'Create intuitive, beautiful learning experiences for millions of students.',
    },
    {
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build and maintain scalable infrastructure for our growing platform.',
    },
    {
      title: 'Content Marketing Manager',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
      description: 'Tell our story and help learners discover the power of our platform.',
    },
  ];

  const values = [
    {
      icon: Users,
      title: 'Student First',
      description: 'Everything we do is focused on creating the best learning experience.',
    },
    {
      icon: Rocket,
      title: 'Move Fast',
      description: 'We iterate quickly, learn from our mistakes, and ship often.',
    },
    {
      icon: Heart,
      title: 'Empathy & Impact',
      description: 'We care deeply about our students and the impact we create.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We embrace new ideas and technologies to solve hard problems.',
    },
  ];

  const benefits = [
    'Competitive salary and equity',
    'Comprehensive health, dental, and vision insurance',
    'Unlimited PTO and flexible work hours',
    'Remote-first culture',
    '$2,000 annual learning & development budget',
    'Latest tech equipment',
    'Regular team offsites',
    'Parental leave',
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4">We're Hiring!</Badge>
            <h1 className="mb-4 text-5xl font-bold">Join Our Mission</h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Help us democratize education and empower millions of learners worldwide
            </p>
            <Button size="lg" asChild>
              <a href="#openings">
                View Open Positions
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Our Values</h2>
            <p className="text-lg text-muted-foreground">
              What we believe in and how we work
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Benefits & Perks</h2>
            <p className="text-lg text-muted-foreground">
              We take care of our team so they can focus on what matters
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="openings" className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Open Positions</h2>
            <p className="text-lg text-muted-foreground">
              Find your next opportunity with us
            </p>
          </div>

          <div className="mx-auto max-w-4xl space-y-4">
            {openings.map((job, i) => (
              <Card key={i} className="transition-all hover:shadow-lg">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <Badge variant="secondary">{job.department}</Badge>
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.type}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {job.department}
                      </div>
                    </div>
                  </div>
                  <Button>
                    Apply
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="mb-4 text-muted-foreground">
              Don't see the right role? We'd still love to hear from you.
            </p>
            <Button variant="outline">Send Us Your Resume</Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
