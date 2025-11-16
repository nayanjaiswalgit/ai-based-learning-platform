'use client';

import { useState, useEffect } from 'react';
import { FormConfig } from './types';
import { fetchFormConfigCached } from './api';

/**
 * Hook to fetch and manage server-driven form configuration
 * @param formId - The ID of the form to fetch
 * @param initialConfig - Optional initial config (for SSR or fallback)
 * @returns Form config, loading state, and error
 */
export function useFormConfig(formId: string, initialConfig?: FormConfig) {
  const [config, setConfig] = useState<FormConfig | null>(initialConfig || null);
  const [loading, setLoading] = useState(!initialConfig);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadConfig() {
      try {
        setLoading(true);
        setError(null);
        const fetchedConfig = await fetchFormConfigCached(formId);

        if (!cancelled) {
          setConfig(fetchedConfig);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load form config'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadConfig();

    return () => {
      cancelled = true;
    };
  }, [formId, initialConfig]);

  return { config, loading, error };
}

/**
 * Hook to manage form state with server-driven validation
 * @param formId - The ID of the form
 * @returns Form state and handlers
 */
export function useServerForm(formId: string) {
  const [data, setData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (name: string, value: any) => {
    setData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const touchField = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const reset = () => {
    setData({});
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    data,
    errors,
    touched,
    isSubmitting,
    updateField,
    touchField,
    setErrors,
    setIsSubmitting,
    reset,
  };
}
