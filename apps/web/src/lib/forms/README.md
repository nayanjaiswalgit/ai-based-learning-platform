# Config-Driven & Server-Driven Form System

A comprehensive, flexible form system that supports both config-driven and server-driven forms with built-in validation, conditional fields, and more.

## Features

- **Config-driven forms**: Define forms using JSON configuration
- **Server-driven forms**: Fetch form configs from the server
- **Comprehensive validation**: Built-in validators (required, email, min/max, pattern, custom)
- **Conditional fields**: Show/hide fields based on other field values
- **Password toggle**: Built-in password visibility toggle
- **Multiple field types**: text, email, password, number, checkbox, radio, select, textarea, file, etc.
- **Social auth integration**: Support for OAuth providers (Google, GitHub, etc.)
- **Form state management**: Automatic error tracking, touched fields, submission state
- **Caching**: Built-in caching for server-fetched configs

## Quick Start

### 1. Config-Driven Form (Client-Side)

```typescript
import { FormRenderer } from '@/components/forms/FormRenderer';
import { loginFormConfig } from '@/lib/forms/configs/login';

export default function LoginPage() {
  return <FormRenderer config={loginFormConfig} />;
}
```

### 2. Server-Driven Form

```typescript
'use client';

import { FormRenderer } from '@/components/forms/FormRenderer';
import { useFormConfig } from '@/lib/forms/hooks';

export default function DynamicFormPage() {
  const { config, loading, error } = useFormConfig('login-form');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!config) return null;

  return <FormRenderer config={config} />;
}
```

### 3. Custom Submit Handler

```typescript
import { FormRenderer } from '@/components/forms/FormRenderer';
import { loginFormConfig } from '@/lib/forms/configs/login';

export default function CustomSubmitPage() {
  const handleSubmit = async (data: Record<string, any>) => {
    console.log('Form data:', data);
    // Custom submission logic
    await fetch('/api/custom-endpoint', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  return <FormRenderer config={loginFormConfig} onSubmit={handleSubmit} />;
}
```

## Creating a Form Config

```typescript
import { FormConfig } from '@/lib/forms/types';

export const myFormConfig: FormConfig = {
  id: 'my-form',
  title: 'My Form',
  description: 'This is my custom form',
  method: 'POST',
  action: '/api/forms/my-form/submit',
  sections: [
    {
      id: 'section-1',
      title: 'Personal Information',
      fields: [
        {
          id: 'name',
          name: 'name',
          label: 'Full Name',
          type: 'text',
          placeholder: 'Enter your name',
          validation: [
            { type: 'required', message: 'Name is required' },
            { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
          ],
        },
        {
          id: 'email',
          name: 'email',
          label: 'Email',
          type: 'email',
          validation: [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Invalid email format' },
          ],
        },
      ],
    },
  ],
  actions: [
    {
      type: 'submit',
      label: 'Submit',
      loadingText: 'Submitting...',
      variant: 'default',
      className: 'w-full',
    },
  ],
};
```

## Validation Rules

### Built-in Validators

- `required`: Field must have a value
- `email`: Must be valid email format
- `min`: Minimum numeric value
- `max`: Maximum numeric value
- `minLength`: Minimum string length
- `maxLength`: Maximum string length
- `pattern`: Regex pattern match
- `custom`: Custom validation function

### Custom Validation

```typescript
{
  id: 'password',
  name: 'password',
  label: 'Password',
  type: 'password',
  validation: [
    {
      type: 'custom',
      message: 'Password must contain uppercase, lowercase, number, and special character',
      validator: (value: string) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
      },
    },
  ],
}
```

### Cross-Field Validation

```typescript
{
  id: 'confirmPassword',
  name: 'confirmPassword',
  label: 'Confirm Password',
  type: 'password',
  validation: [
    {
      type: 'custom',
      message: 'Passwords do not match',
      validator: (value: string, formData: Record<string, any>) => {
        return value === formData.password;
      },
    },
  ],
}
```

## Conditional Fields

Show/hide fields based on other field values:

```typescript
{
  id: 'otherReason',
  name: 'otherReason',
  label: 'Please specify',
  type: 'text',
  conditionalDisplay: {
    field: 'reason',
    operator: 'equals',
    value: 'other',
  },
}
```

Supported operators:
- `equals`: Field value equals condition value
- `notEquals`: Field value does not equal condition value
- `contains`: Field value contains condition value (string)
- `greaterThan`: Field value is greater than condition value (numeric)
- `lessThan`: Field value is less than condition value (numeric)

## Field Types

### Text Inputs
- `text`: Standard text input
- `email`: Email input with validation
- `password`: Password input (supports toggle)
- `tel`: Telephone number
- `url`: URL input
- `number`: Numeric input
- `date`: Date picker

### Selection
- `checkbox`: Single checkbox
- `radio`: Radio button group
- `select`: Dropdown select

### Other
- `textarea`: Multi-line text input
- `file`: File upload (supports multiple)
- `hidden`: Hidden field

## Social Authentication

```typescript
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
]
```

## Server-Side API

### Fetch Form Config

```typescript
import { fetchFormConfig } from '@/lib/forms/api';

const config = await fetchFormConfig('my-form-id');
```

### Submit Form

```typescript
import { submitForm } from '@/lib/forms/api';

const result = await submitForm('my-form-id', formData);
```

### Server-Side Validation

```typescript
import { validateFormOnServer } from '@/lib/forms/api';

const errors = await validateFormOnServer('my-form-id', formData);
```

## Architecture

```
lib/forms/
├── types.ts              # TypeScript type definitions
├── validation.ts         # Validation utilities
├── api.ts               # Server API utilities
├── hooks.ts             # React hooks
├── index.ts             # Barrel exports
├── configs/             # Form configurations
│   ├── login.ts
│   ├── signup.ts
│   └── forgot-password.ts
└── README.md

components/forms/
└── FormRenderer.tsx      # Main form renderer component
```

## Best Practices

1. **Use TypeScript**: Leverage type safety with `FormConfig` type
2. **Validate on both sides**: Use client-side validation for UX, server-side for security
3. **Cache server configs**: Use `fetchFormConfigCached` for better performance
4. **Provide clear error messages**: Users should understand what's wrong
5. **Use conditional fields wisely**: Keep forms simple and progressive
6. **Test validation rules**: Ensure validators work as expected
7. **Handle loading states**: Show feedback while fetching server configs

## Examples

See the `configs/` directory for complete examples:
- `login.ts`: Login form with email/password and social auth
- `signup.ts`: Registration form with multiple sections and complex validation
- `forgot-password.ts`: Simple password reset form
