import { FormConfig } from '../types';

export const signupFormConfig: FormConfig = {
  id: 'signup-form',
  title: 'Create your account',
  description: 'Start your learning journey today.',
  method: 'POST',
  action: '/api/auth/signup',
  sections: [
    {
      id: 'personal-info',
      title: 'Personal Information',
      fields: [
        {
          id: 'name',
          name: 'name',
          label: 'Full Name',
          type: 'text',
          placeholder: 'Enter your full name',
          validation: [
            {
              type: 'required',
              message: 'Name is required',
            },
            {
              type: 'minLength',
              value: 2,
              message: 'Name must be at least 2 characters',
            },
          ],
        },
        {
          id: 'email',
          name: 'email',
          label: 'Email address',
          type: 'email',
          placeholder: 'Enter your email',
          validation: [
            {
              type: 'required',
              message: 'Email is required',
            },
            {
              type: 'email',
              message: 'Please enter a valid email address',
            },
          ],
        },
      ],
    },
    {
      id: 'security',
      title: 'Security',
      fields: [
        {
          id: 'password',
          name: 'password',
          label: 'Password',
          type: 'password',
          placeholder: 'Create a password',
          showPasswordToggle: true,
          helpText: 'Must be at least 8 characters with uppercase, lowercase, number, and special character',
          validation: [
            {
              type: 'required',
              message: 'Password is required',
            },
            {
              type: 'minLength',
              value: 8,
              message: 'Password must be at least 8 characters',
            },
            {
              type: 'custom',
              message: 'Password must contain uppercase, lowercase, number, and special character',
              validator: (value: string) => {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
              },
            },
          ],
        },
        {
          id: 'confirmPassword',
          name: 'confirmPassword',
          label: 'Confirm Password',
          type: 'password',
          placeholder: 'Confirm your password',
          showPasswordToggle: true,
          validation: [
            {
              type: 'required',
              message: 'Please confirm your password',
            },
            {
              type: 'custom',
              message: 'Passwords do not match',
              validator: (value: string, formData: Record<string, any>) => {
                return value === formData.password;
              },
            },
          ],
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Preferences',
      fields: [
        {
          id: 'role',
          name: 'role',
          label: 'I am a',
          type: 'select',
          placeholder: 'Select your role',
          options: [
            { value: 'student', label: 'Student' },
            { value: 'professional', label: 'Professional' },
            { value: 'instructor', label: 'Instructor' },
          ],
          validation: [
            {
              type: 'required',
              message: 'Please select your role',
            },
          ],
        },
      ],
    },
    {
      id: 'terms',
      fields: [
        {
          id: 'agreeToTerms',
          name: 'agreeToTerms',
          label: 'I agree to the Terms of Service and Privacy Policy',
          type: 'checkbox',
          validation: [
            {
              type: 'custom',
              message: 'You must agree to the terms to continue',
              validator: (value: boolean) => value === true,
            },
          ],
        },
        {
          id: 'newsletter',
          name: 'newsletter',
          label: 'Send me learning tips and course updates',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
  ],
  actions: [
    {
      type: 'submit',
      label: 'Create account',
      loadingText: 'Creating account...',
      variant: 'default',
      className: 'w-full',
    },
  ],
  socialAuth: [
    {
      provider: 'google',
      label: 'Sign up with Google',
      callbackUrl: '/api/auth/google',
      enabled: true,
    },
    {
      provider: 'github',
      label: 'Sign up with GitHub',
      callbackUrl: '/api/auth/github',
      enabled: true,
    },
  ],
  onSuccess: {
    message: 'Account created successfully! Redirecting...',
    redirect: '/onboarding',
  },
};
