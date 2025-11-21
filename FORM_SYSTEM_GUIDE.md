# Config-Driven Form System Guide

## Overview

The application uses a comprehensive config-driven form system that allows you to create complex forms using simple JSON configurations instead of writing repetitive React code.

## Benefits

- **Consistency**: All forms follow the same structure and styling
- **Validation**: Built-in validation with custom rules
- **Type Safety**: Full TypeScript support
- **Maintainability**: Easy to update and maintain
- **Reusability**: Share form configurations across the app
- **Dynamic Forms**: Support for conditional fields and server-driven forms

## Quick Start

### 1. Using Pre-built Form Configs

```tsx
import { FormRenderer } from '@/components/forms/FormRenderer';
import { loginFormConfig } from '@/lib/forms/configs';

export function LoginPage() {
  const handleSubmit = async (data: Record<string, any>) => {
    // Handle form submission
    console.log('Form data:', data);
  };

  return (
    <div className="max-w-md mx-auto">
      <FormRenderer
        config={loginFormConfig}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
```

### 2. Creating a Custom Form Config

```tsx
import { FormConfig } from '@/lib/forms/types';

const myFormConfig: FormConfig = {
  id: 'my-form',
  title: 'My Custom Form',
  description: 'This is a custom form',
  method: 'POST',
  action: '/api/my-endpoint',
  sections: [
    {
      id: 'section-1',
      title: 'Basic Info',
      fields: [
        {
          id: 'name',
          name: 'name',
          label: 'Full Name',
          type: 'text',
          placeholder: 'Enter your name',
          validation: [
            { type: 'required', message: 'Name is required' },
            { type: 'minLength', value: 3, message: 'Name must be at least 3 characters' },
          ],
        },
        {
          id: 'email',
          name: 'email',
          label: 'Email',
          type: 'email',
          validation: [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Invalid email address' },
          ],
        },
      ],
    },
  ],
  actions: [
    {
      type: 'submit',
      label: 'Submit',
      variant: 'default',
      className: 'btn-modern',
    },
  ],
};
```

## Available Form Configurations

### Authentication Forms
- `loginFormConfig` - User login form
- `signupFormConfig` - User registration form
- `forgotPasswordFormConfig` - Password reset request
- `resetPasswordFormConfig` - New password setup

### Course Management Forms
- `createCourseFormConfig` - Create new course
- `editCourseFormConfig` - Edit existing course
- `createModuleFormConfig` - Add course module
- `createLessonFormConfig` - Add lesson to module

### Organization Forms
- `createOrganizationFormConfig` - Create organization
- `editOrganizationFormConfig` - Edit organization
- `inviteUserFormConfig` - Invite team members

### DSA Forms
- `createDSAProblemFormConfig` - Add DSA problem
- `generateDSASheetFormConfig` - Generate practice sheet

### Community Forms
- `createThreadFormConfig` - Start discussion thread
- `replyFormConfig` - Reply to thread

## Field Types

### Text Inputs
- `text` - Single line text input
- `email` - Email input with validation
- `password` - Password input with toggle
- `tel` - Phone number input
- `url` - URL input with validation
- `number` - Numeric input
- `date` - Date picker
- `time` - Time picker
- `datetime-local` - Date and time picker

### Multi-line
- `textarea` - Multi-line text input

### Selection
- `select` - Dropdown select
- `radio` - Radio button group
- `checkbox` - Single checkbox

### Other
- `file` - File upload
- `hidden` - Hidden field

## Validation Rules

### Built-in Validators

```tsx
{
  validation: [
    { type: 'required', message: 'This field is required' },
    { type: 'email', message: 'Invalid email address' },
    { type: 'min', value: 18, message: 'Must be at least 18' },
    { type: 'max', value: 100, message: 'Must be at most 100' },
    { type: 'minLength', value: 8, message: 'At least 8 characters' },
    { type: 'maxLength', value: 50, message: 'At most 50 characters' },
    { type: 'pattern', value: '^[A-Z]', message: 'Must start with uppercase' },
  ]
}
```

### Custom Validators

```tsx
{
  validation: [
    {
      type: 'custom',
      message: 'Passwords must match',
      validator: (value, formData) => value === formData.password,
    },
  ]
}
```

### Async Validators

```tsx
{
  validation: [
    {
      type: 'custom',
      message: 'Username already taken',
      validator: async (value) => {
        const response = await fetch(`/api/check-username?username=${value}`);
        const { available } = await response.json();
        return available;
      },
    },
  ]
}
```

## Conditional Fields

Show/hide fields based on other field values:

```tsx
{
  id: 'country',
  name: 'country',
  label: 'Country',
  type: 'select',
  options: [/* ... */],
},
{
  id: 'state',
  name: 'state',
  label: 'State',
  type: 'select',
  conditionalDisplay: {
    field: 'country',
    operator: 'equals',
    value: 'US',
  },
  options: [/* ... */],
}
```

### Conditional Operators
- `equals` - Field equals value
- `notEquals` - Field doesn't equal value
- `contains` - Field contains value
- `greaterThan` - Field is greater than value
- `lessThan` - Field is less than value

## Layout Options

### Single Column (Default)

```tsx
{
  id: 'section-1',
  fields: [/* ... */],
}
```

### Grid Layout

```tsx
{
  id: 'section-1',
  layout: 'grid',
  columns: 2, // or 3, 4
  fields: [/* ... */],
}
```

## Form Actions

```tsx
actions: [
  {
    type: 'button',
    label: 'Cancel',
    variant: 'outline',
  },
  {
    type: 'reset',
    label: 'Clear Form',
    variant: 'ghost',
  },
  {
    type: 'submit',
    label: 'Submit',
    variant: 'default',
    loadingText: 'Submitting...',
    className: 'btn-modern',
  },
]
```

## Social Authentication

Add social login options:

```tsx
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
]
```

## Success/Error Handling

```tsx
onSuccess: {
  message: 'Form submitted successfully!',
  redirect: '/dashboard', // Optional redirect
  callback: 'handleSuccess', // Optional callback
},
onError: {
  message: 'Something went wrong',
  callback: 'handleError',
}
```

## Advanced Examples

### Multi-step Form

```tsx
const step1Config: FormConfig = {
  id: 'step-1',
  title: 'Step 1: Basic Info',
  sections: [/* ... */],
  actions: [
    {
      type: 'submit',
      label: 'Next',
      variant: 'default',
    },
  ],
};

const step2Config: FormConfig = {
  id: 'step-2',
  title: 'Step 2: Additional Details',
  sections: [/* ... */],
  actions: [
    {
      type: 'button',
      label: 'Back',
      variant: 'outline',
    },
    {
      type: 'submit',
      label: 'Finish',
      variant: 'default',
    },
  ],
};
```

### Dynamic Form from API

```tsx
export function DynamicForm() {
  const [config, setConfig] = useState<FormConfig | null>(null);

  useEffect(() => {
    fetch('/api/forms/my-form-config')
      .then(res => res.json())
      .then(setConfig);
  }, []);

  if (!config) return <div>Loading...</div>;

  return <FormRenderer config={config} />;
}
```

### Customizing Existing Configs

```tsx
import { cloneFormConfig, loginFormConfig } from '@/lib/forms/configs';

const customLoginConfig = cloneFormConfig(loginFormConfig, {
  title: 'Admin Login',
  description: 'Sign in to admin panel',
  onSuccess: {
    redirect: '/admin/dashboard',
  },
});
```

### Form with File Upload

```tsx
{
  id: 'profile-picture',
  name: 'profilePicture',
  label: 'Profile Picture',
  type: 'file',
  accept: 'image/*',
  helpText: 'Upload a JPG or PNG image (max 5MB)',
  validation: [
    { type: 'required', message: 'Profile picture is required' },
    {
      type: 'custom',
      message: 'File size must be less than 5MB',
      validator: (file: File) => file.size <= 5 * 1024 * 1024,
    },
  ],
}
```

### Select with Dynamic Options

```tsx
const [countries, setCountries] = useState([]);

useEffect(() => {
  fetch('/api/countries')
    .then(res => res.json())
    .then(data => setCountries(data));
}, []);

const formConfig = {
  // ...
  sections: [{
    fields: [{
      id: 'country',
      name: 'country',
      label: 'Country',
      type: 'select',
      options: countries.map(c => ({
        label: c.name,
        value: c.code,
      })),
    }],
  }],
};
```

## Best Practices

### 1. Use Descriptive IDs and Names

```tsx
// Good
{ id: 'user-email', name: 'email', label: 'Email Address' }

// Avoid
{ id: 'field1', name: 'f1', label: 'Email' }
```

### 2. Provide Helpful Text

```tsx
{
  id: 'password',
  name: 'password',
  label: 'Password',
  type: 'password',
  helpText: 'Must be at least 8 characters with uppercase, lowercase, and numbers',
  placeholder: 'Enter a strong password',
}
```

### 3. Group Related Fields

```tsx
{
  id: 'personal-info',
  title: 'Personal Information',
  layout: 'grid',
  columns: 2,
  fields: [
    { id: 'firstName', /* ... */ },
    { id: 'lastName', /* ... */ },
  ],
}
```

### 4. Use Appropriate Validation

```tsx
// Email field
{ type: 'email', validation: [{ type: 'email', message: 'Invalid email' }] }

// Phone number
{ type: 'tel', validation: [{ type: 'pattern', value: '^\\+?[1-9]\\d{1,14}$', message: 'Invalid phone' }] }

// URL
{ type: 'url', validation: [{ type: 'pattern', value: '^https?://', message: 'Must start with http:// or https://' }] }
```

### 5. Handle Loading and Error States

```tsx
const handleSubmit = async (data: Record<string, any>) => {
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Submission failed');
    }

    // Success
    toast.success('Form submitted successfully!');
  } catch (error) {
    toast.error('Something went wrong');
  }
};
```

## Migration Guide

### From Hardcoded Forms to Config-Driven

**Before:**
```tsx
<form onSubmit={handleSubmit}>
  <div>
    <label>Email</label>
    <input
      type="email"
      value={email}
      onChange={e => setEmail(e.target.value)}
      required
    />
  </div>
  <div>
    <label>Password</label>
    <input
      type="password"
      value={password}
      onChange={e => setPassword(e.target.value)}
      required
    />
  </div>
  <button type="submit">Login</button>
</form>
```

**After:**
```tsx
<FormRenderer
  config={loginFormConfig}
  onSubmit={handleSubmit}
/>
```

## Troubleshooting

### Forms Not Validating
- Check that validation rules are properly formatted
- Ensure field names match between validator and formData
- Verify async validators return boolean or Promise<boolean>

### Conditional Fields Not Showing
- Verify the dependent field name matches exactly
- Check that the operator and value are correct
- Ensure the parent field is not hidden

### Style Issues
- Verify Tailwind classes are not being purged
- Check that the design system is properly imported
- Ensure custom className props don't conflict

## API Reference

See `/apps/web/src/lib/forms/types.ts` for complete TypeScript definitions.

## Contributing

To add new form configurations:

1. Create a new file in `/apps/web/src/lib/forms/configs/`
2. Define your form configuration
3. Export it from `/apps/web/src/lib/forms/configs/index.ts`
4. Update this documentation

## Examples Repository

See `/apps/web/src/components/forms/examples/` for more examples and use cases.
