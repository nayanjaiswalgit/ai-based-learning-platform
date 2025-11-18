'use client';

import React, { useState, useCallback, FormEvent } from 'react';
import { FormConfig, FormField, FormState } from '@/lib/forms/types';
import { validateField, shouldDisplayField, getFieldDefaultValue } from '@/lib/forms/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormRendererProps {
  config: FormConfig;
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;
  className?: string;
}

export function FormRenderer({ config, onSubmit, className = '' }: FormRendererProps) {
  // Initialize form data with default values
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initialData: Record<string, any> = {};
    config.sections.forEach(section => {
      section.fields.forEach(field => {
        initialData[field.name] = getFieldDefaultValue(field);
      });
    });
    return initialData;
  });

  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    errors: {},
    touched: {},
    isDirty: false,
  });

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Handle field value change
  const handleFieldChange = useCallback((field: FormField, value: any) => {
    setFormData(prev => ({ ...prev, [field.name]: value }));
    setFormState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field.name];
      return {
        ...prev,
        isDirty: true,
        errors: newErrors,
      };
    });
  }, []);

  // Handle field blur for validation
  const handleFieldBlur = useCallback(async (field: FormField) => {
    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field.name]: true },
    }));

    const error = await validateField(field, formData[field.name], formData);
    if (error) {
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, [field.name]: error },
      }));
    }
  }, [formData]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    // Validate all fields
    const errors: Record<string, string> = {};
    const touched: Record<string, boolean> = {};

    for (const section of config.sections) {
      for (const field of section.fields) {
        if (!shouldDisplayField(field, formData)) continue;

        touched[field.name] = true;
        const error = await validateField(field, formData[field.name], formData);
        if (error) {
          errors[field.name] = error;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormState(prev => ({
        ...prev,
        errors,
        touched,
        isSubmitting: false,
      }));
      return;
    }

    try {
      // Call custom onSubmit handler if provided
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default form submission
        const response = await fetch(config.action, {
          method: config.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Form submission failed');
        }

        // Handle success
        if (config.onSuccess?.redirect) {
          window.location.href = config.onSuccess.redirect;
        }
      }

      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        submitSuccess: true,
      }));
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        submitError: error instanceof Error ? error.message : 'Submission failed',
      }));
    }
  };

  // Render individual field
  const renderField = (field: FormField) => {
    if (!shouldDisplayField(field, formData)) {
      return null;
    }

    const value = formData[field.name] ?? '';
    const error = formState.touched[field.name] ? formState.errors[field.name] : undefined;
    const showPassword = showPasswords[field.name];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'number':
      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.validation?.some(v => v.type === 'required') && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.id}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              disabled={field.disabled}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              onBlur={() => handleFieldBlur(field)}
              className={error ? 'border-destructive' : ''}
            />
            {field.helperText && (
              <p className="text-sm text-muted-foreground">{field.helperText}</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'password':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <div className="relative">
              <Input
                id={field.id}
                name={field.name}
                type={showPassword ? 'text' : 'password'}
                placeholder={field.placeholder}
                value={value}
                disabled={field.disabled}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                onBlur={() => handleFieldBlur(field)}
                className={error ? 'border-red-500' : ''}
              />
              {field.showPasswordToggle && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPasswords(prev => ({ ...prev, [field.name]: !prev[field.name] }))}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              )}
            </div>
            {field.helperText && (
              <p className="text-sm text-gray-500">{field.helperText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <textarea
              id={field.id}
              name={field.name}
              placeholder={field.placeholder}
              value={value}
              disabled={field.disabled}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              onBlur={() => handleFieldBlur(field)}
              className={`flex min-h-[80px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-destructive' : ''}`}
            />
            {field.helperText && (
              <p className="text-sm text-gray-500">{field.helperText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <input
              id={field.id}
              name={field.name}
              type="checkbox"
              checked={!!value}
              disabled={field.disabled}
              onChange={(e) => handleFieldChange(field, e.target.checked)}
              onBlur={() => handleFieldBlur(field)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <Label htmlFor={field.id} className="text-sm font-normal">
              {field.label}
              {field.validation?.some(v => v.type === 'required') && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            {error && <p className="text-sm text-destructive ml-2">{error}</p>}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <div className="space-y-2">
              {field.options?.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <input
                    id={`${field.id}-${option.value}`}
                    name={field.name}
                    type="radio"
                    value={option.value}
                    checked={value === option.value}
                    disabled={field.disabled || option.disabled}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    className="h-4 w-4 border-border text-primary focus:ring-primary"
                  />
                  <Label htmlFor={`${field.id}-${option.value}`} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <select
              id={field.id}
              name={field.name}
              value={value}
              disabled={field.disabled}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              onBlur={() => handleFieldBlur(field)}
              className={`flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-destructive' : ''}`}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              ))}
            </select>
            {field.helperText && (
              <p className="text-sm text-gray-500">{field.helperText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'file':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <input
              id={field.id}
              name={field.name}
              type="file"
              multiple={field.multiple}
              accept={field.accept}
              disabled={field.disabled}
              onChange={(e) => handleFieldChange(field, field.multiple ? Array.from(e.target.files || []) : e.target.files?.[0])}
              onBlur={() => handleFieldBlur(field)}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            />
            {field.helperText && (
              <p className="text-sm text-gray-500">{field.helperText}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'hidden':
        return (
          <input
            key={field.id}
            type="hidden"
            id={field.id}
            name={field.name}
            value={value}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {config.title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{config.title}</h2>
          {config.description && (
            <p className="text-gray-600 mt-2">{config.description}</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {config.sections.map((section, index) => (
          <div key={section.id || index} className="space-y-4">
            {section.title && (
              <h3 className="text-lg font-semibold">{section.title}</h3>
            )}
            {section.description && (
              <p className="text-sm text-muted-foreground">{section.description}</p>
            )}
            <div className={`grid gap-4 ${section.layout === 'grid' ? `grid-cols-1 md:grid-cols-${section.columns || 2}` : ''}`}>
              {section.fields.map(field => renderField(field))}
            </div>
          </div>
        ))}

        {/* Form actions */}
        <div className="flex flex-col gap-4">
          {formState.submitError && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
              {formState.submitError}
            </div>
          )}

          {formState.submitSuccess && config.onSuccess?.message && (
            <div className="p-3 bg-success/10 border border-success rounded text-sm text-success">
              {config.onSuccess.message}
            </div>
          )}

          <div className="flex gap-3">
            {config.actions.map((action, index) => (
              <Button
                key={index}
                type={action.type}
                variant={action.variant as 'default' | 'outline'}
                disabled={formState.isSubmitting || action.disabled}
                className={action.className}
              >
                {formState.isSubmitting && action.type === 'submit'
                  ? action.loadingText || 'Submitting...'
                  : action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Social auth providers */}
        {config.socialAuth && config.socialAuth.length > 0 && (
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {config.socialAuth.map((provider) => (
                <Button
                  key={provider.provider}
                  type="button"
                  variant="outline"
                  onClick={() => window.location.href = provider.callbackUrl}
                  disabled={!provider.enabled}
                  className="w-full"
                >
                  {provider.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
