import { FormConfig } from '../types';

export const forgotPasswordFormConfig: FormConfig = {
  id: 'forgot-password-form',
  title: 'Reset your password',
  description: "Enter your email address and we'll send you a link to reset your password.",
  method: 'POST',
  action: '/api/auth/forgot-password',
  sections: [
    {
      id: 'email-section',
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
      ],
    },
  ],
  actions: [
    {
      type: 'submit',
      label: 'Send reset link',
      loadingText: 'Sending...',
      variant: 'default',
      className: 'w-full',
    },
  ],
  onSuccess: {
    message: 'Password reset link sent! Check your email.',
  },
};
