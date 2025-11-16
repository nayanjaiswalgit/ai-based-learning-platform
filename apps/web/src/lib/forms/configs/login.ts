import { FormConfig } from '../types';

export const loginFormConfig: FormConfig = {
  id: 'login-form',
  title: 'Sign in to your account',
  description: 'Welcome back! Please enter your credentials.',
  method: 'POST',
  action: '/api/auth/login',
  sections: [
    {
      id: 'credentials',
      fields: [
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
        {
          id: 'password',
          name: 'password',
          label: 'Password',
          type: 'password',
          placeholder: 'Enter your password',
          showPasswordToggle: true,
          validation: [
            {
              type: 'required',
              message: 'Password is required',
            },
          ],
        },
        {
          id: 'remember',
          name: 'remember',
          label: 'Remember me for 30 days',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
  actions: [
    {
      type: 'submit',
      label: 'Sign in',
      loadingText: 'Signing in...',
      variant: 'default',
      className: 'w-full',
    },
  ],
  socialAuth: [
    {
      provider: 'google',
      label: 'Continue with Google',
      callbackUrl: '/api/auth/google',
      enabled: true,
    },
    {
      provider: 'github',
      label: 'Continue with GitHub',
      callbackUrl: '/api/auth/github',
      enabled: true,
    },
  ],
  onSuccess: {
    message: 'Successfully signed in!',
    redirect: '/dashboard',
  },
};
