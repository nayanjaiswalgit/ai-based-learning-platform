/**
 * Authentication Form Configurations
 * Config-driven forms for login, signup, forgot password, etc.
 */

import { FormConfig } from '../types';

export const loginFormConfig: FormConfig = {
  id: 'login-form',
  title: 'Welcome Back',
  description: 'Sign in to your account to continue',
  method: 'POST',
  action: '/api/auth/login',
  sections: [
    {
      id: 'credentials',
      fields: [
        {
          id: 'email',
          name: 'email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'you@example.com',
          autoComplete: 'email',
          validation: [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email address' },
          ],
        },
        {
          id: 'password',
          name: 'password',
          label: 'Password',
          type: 'password',
          placeholder: '••••••••',
          autoComplete: 'current-password',
          showPasswordToggle: true,
          validation: [
            { type: 'required', message: 'Password is required' },
            { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
          ],
        },
        {
          id: 'remember',
          name: 'remember',
          label: 'Remember me',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
  actions: [
    {
      type: 'submit',
      label: 'Sign In',
      variant: 'default',
      loadingText: 'Signing in...',
      className: 'w-full btn-modern',
    },
  ],
  socialAuth: [
    {
      provider: 'google',
      label: 'Continue with Google',
      enabled: true,
      callbackUrl: '/api/auth/google',
    },
    {
      provider: 'github',
      label: 'Continue with GitHub',
      enabled: true,
      callbackUrl: '/api/auth/github',
    },
  ],
  footer: {
    text: "Don't have an account?",
    link: {
      text: 'Sign up',
      href: '/signup',
    },
  },
  onSuccess: {
    message: 'Successfully logged in!',
    redirect: '/dashboard',
  },
};

export const signupFormConfig: FormConfig = {
  id: 'signup-form',
  title: 'Create Account',
  description: 'Get started with your learning journey',
  method: 'POST',
  action: '/api/auth/signup',
  sections: [
    {
      id: 'personal-info',
      title: 'Personal Information',
      layout: 'grid',
      columns: 2,
      fields: [
        {
          id: 'firstName',
          name: 'firstName',
          label: 'First Name',
          type: 'text',
          placeholder: 'John',
          autoComplete: 'given-name',
          validation: [
            { type: 'required', message: 'First name is required' },
            { type: 'minLength', value: 2, message: 'First name must be at least 2 characters' },
          ],
        },
        {
          id: 'lastName',
          name: 'lastName',
          label: 'Last Name',
          type: 'text',
          placeholder: 'Doe',
          autoComplete: 'family-name',
          validation: [
            { type: 'required', message: 'Last name is required' },
            { type: 'minLength', value: 2, message: 'Last name must be at least 2 characters' },
          ],
        },
      ],
    },
    {
      id: 'account-credentials',
      title: 'Account Credentials',
      fields: [
        {
          id: 'email',
          name: 'email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'you@example.com',
          autoComplete: 'email',
          validation: [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email address' },
          ],
        },
        {
          id: 'password',
          name: 'password',
          label: 'Password',
          type: 'password',
          placeholder: '••••••••',
          autoComplete: 'new-password',
          showPasswordToggle: true,
          helpText: 'Must be at least 8 characters with uppercase, lowercase, and numbers',
          validation: [
            { type: 'required', message: 'Password is required' },
            { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
            {
              type: 'pattern',
              value: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
              message: 'Password must contain uppercase, lowercase, and numbers',
            },
          ],
        },
        {
          id: 'confirmPassword',
          name: 'confirmPassword',
          label: 'Confirm Password',
          type: 'password',
          placeholder: '••••••••',
          autoComplete: 'new-password',
          showPasswordToggle: true,
          validation: [
            { type: 'required', message: 'Please confirm your password' },
            {
              type: 'custom',
              message: 'Passwords do not match',
              validator: (value, formData) => value === formData.password,
            },
          ],
        },
      ],
    },
    {
      id: 'terms',
      fields: [
        {
          id: 'acceptTerms',
          name: 'acceptTerms',
          label: 'I agree to the Terms of Service and Privacy Policy',
          type: 'checkbox',
          validation: [
            {
              type: 'required',
              message: 'You must accept the terms and conditions',
            },
          ],
        },
      ],
    },
  ],
  actions: [
    {
      type: 'submit',
      label: 'Create Account',
      variant: 'default',
      loadingText: 'Creating account...',
      className: 'w-full btn-modern',
    },
  ],
  socialAuth: [
    {
      provider: 'google',
      label: 'Sign up with Google',
      enabled: true,
      callbackUrl: '/api/auth/google',
    },
    {
      provider: 'github',
      label: 'Sign up with GitHub',
      enabled: true,
      callbackUrl: '/api/auth/github',
    },
  ],
  footer: {
    text: 'Already have an account?',
    link: {
      text: 'Sign in',
      href: '/login',
    },
  },
  onSuccess: {
    message: 'Account created successfully!',
    redirect: '/onboarding',
  },
};

export const forgotPasswordFormConfig: FormConfig = {
  id: 'forgot-password-form',
  title: 'Reset Password',
  description: 'Enter your email and we\'ll send you a reset link',
  method: 'POST',
  action: '/api/auth/forgot-password',
  sections: [
    {
      id: 'email-section',
      fields: [
        {
          id: 'email',
          name: 'email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'you@example.com',
          autoComplete: 'email',
          validation: [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email address' },
          ],
        },
      ],
    },
  ],
  actions: [
    {
      type: 'submit',
      label: 'Send Reset Link',
      variant: 'default',
      loadingText: 'Sending...',
      className: 'w-full btn-modern',
    },
  ],
  footer: {
    text: 'Remember your password?',
    link: {
      text: 'Back to login',
      href: '/login',
    },
  },
  onSuccess: {
    message: 'Reset link sent! Check your email.',
  },
};

export const resetPasswordFormConfig: FormConfig = {
  id: 'reset-password-form',
  title: 'Create New Password',
  description: 'Enter your new password below',
  method: 'POST',
  action: '/api/auth/reset-password',
  sections: [
    {
      id: 'password-section',
      fields: [
        {
          id: 'token',
          name: 'token',
          label: '',
          type: 'hidden',
        },
        {
          id: 'password',
          name: 'password',
          label: 'New Password',
          type: 'password',
          placeholder: '••••••••',
          autoComplete: 'new-password',
          showPasswordToggle: true,
          helpText: 'Must be at least 8 characters with uppercase, lowercase, and numbers',
          validation: [
            { type: 'required', message: 'Password is required' },
            { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
            {
              type: 'pattern',
              value: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
              message: 'Password must contain uppercase, lowercase, and numbers',
            },
          ],
        },
        {
          id: 'confirmPassword',
          name: 'confirmPassword',
          label: 'Confirm New Password',
          type: 'password',
          placeholder: '••••••••',
          autoComplete: 'new-password',
          showPasswordToggle: true,
          validation: [
            { type: 'required', message: 'Please confirm your password' },
            {
              type: 'custom',
              message: 'Passwords do not match',
              validator: (value, formData) => value === formData.password,
            },
          ],
        },
      ],
    },
  ],
  actions: [
    {
      type: 'submit',
      label: 'Reset Password',
      variant: 'default',
      loadingText: 'Resetting...',
      className: 'w-full btn-modern',
    },
  ],
  onSuccess: {
    message: 'Password reset successfully!',
    redirect: '/login',
  },
};
