/**
 * Form Validation Utilities
 * Provides validation functions for form fields
 */

import { ValidationRule, FormField } from './types';

export const validators = {
  required: (value: any): boolean => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined;
  },

  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  min: (value: number, min: number): boolean => {
    return value >= min;
  },

  max: (value: number, max: number): boolean => {
    return value <= max;
  },

  minLength: (value: string, minLength: number): boolean => {
    return value.length >= minLength;
  },

  maxLength: (value: string, maxLength: number): boolean => {
    return value.length <= maxLength;
  },

  pattern: (value: string, pattern: string): boolean => {
    const regex = new RegExp(pattern);
    return regex.test(value);
  },

  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  phone: (value: string): boolean => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(value);
  },

  strongPassword: (value: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(value);
  },

  mediumPassword: (value: string): boolean => {
    // At least 8 characters with letters and numbers
    const mediumPasswordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return mediumPasswordRegex.test(value);
  },
};

export async function validateField(
  field: FormField,
  value: any,
  formData: Record<string, any>
): Promise<string | null> {
  if (!field.validation || field.validation.length === 0) {
    return null;
  }

  for (const rule of field.validation) {
    let isValid = false;

    switch (rule.type) {
      case 'required':
        isValid = validators.required(value);
        break;

      case 'email':
        isValid = !value || validators.email(value);
        break;

      case 'min':
        isValid = !value || validators.min(parseFloat(value), rule.value);
        break;

      case 'max':
        isValid = !value || validators.max(parseFloat(value), rule.value);
        break;

      case 'minLength':
        isValid = !value || validators.minLength(value, rule.value);
        break;

      case 'maxLength':
        isValid = !value || validators.maxLength(value, rule.value);
        break;

      case 'pattern':
        isValid = !value || validators.pattern(value, rule.value);
        break;

      case 'custom':
        if (rule.validator) {
          isValid = await Promise.resolve(rule.validator(value, formData));
        }
        break;

      default:
        isValid = true;
    }

    if (!isValid) {
      return rule.message;
    }
  }

  return null;
}

export function shouldDisplayField(
  field: FormField,
  formData: Record<string, any>
): boolean {
  if (!field.conditionalDisplay) return !field.hidden;

  const { field: conditionField, operator, value: conditionValue } = field.conditionalDisplay;
  const fieldValue = formData[conditionField];

  switch (operator) {
    case 'equals':
      return fieldValue === conditionValue;
    case 'notEquals':
      return fieldValue !== conditionValue;
    case 'contains':
      return typeof fieldValue === 'string' && fieldValue.includes(conditionValue);
    case 'greaterThan':
      return parseFloat(fieldValue) > parseFloat(conditionValue);
    case 'lessThan':
      return parseFloat(fieldValue) < parseFloat(conditionValue);
    default:
      return true;
  }
}

export function getFieldDefaultValue(field: FormField): any {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  switch (field.type) {
    case 'checkbox':
      return false;
    case 'number':
      return 0;
    case 'file':
      return field.multiple ? [] : null;
    case 'select':
      return field.multiple ? [] : '';
    default:
      return '';
  }
}
