import Link from 'next/link';
import { FormRenderer } from '@/components/forms/FormRenderer';
import { signupFormConfig } from '@/lib/forms/configs/signup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">AI Learn</span>
            </Link>
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Enter your details to get started with AI-powered learning</CardDescription>
        </CardHeader>
        <CardContent>
          <FormRenderer config={signupFormConfig} />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
