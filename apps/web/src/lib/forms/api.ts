import { FormConfig } from './types';

/**
 * Fetch form configuration from the server
 * @param formId - The ID of the form to fetch
 * @returns Promise resolving to the form configuration
 */
export async function fetchFormConfig(formId: string): Promise<FormConfig> {
  try {
    const response = await fetch(`/api/forms/${formId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch form config: ${response.statusText}`);
    }

    const config = await response.json();
    return config;
  } catch (error) {
    console.error('Error fetching form config:', error);
    throw error;
  }
}

/**
 * Fetch multiple form configurations
 * @param formIds - Array of form IDs to fetch
 * @returns Promise resolving to an object mapping form IDs to configs
 */
export async function fetchFormConfigs(formIds: string[]): Promise<Record<string, FormConfig>> {
  try {
    const response = await fetch('/api/forms/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formIds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch form configs: ${response.statusText}`);
    }

    const configs = await response.json();
    return configs;
  } catch (error) {
    console.error('Error fetching form configs:', error);
    throw error;
  }
}

/**
 * Submit form data to the server
 * @param formId - The ID of the form being submitted
 * @param data - The form data to submit
 * @param action - Optional custom action URL
 * @returns Promise resolving to the server response
 */
export async function submitForm(
  formId: string,
  data: Record<string, any>,
  action?: string
): Promise<any> {
  try {
    const url = action || `/api/forms/${formId}/submit`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Form submission failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
}

/**
 * Validate form data against server-side rules
 * @param formId - The ID of the form
 * @param data - The form data to validate
 * @returns Promise resolving to validation errors (if any)
 */
export async function validateFormOnServer(
  formId: string,
  data: Record<string, any>
): Promise<Record<string, string>> {
  try {
    const response = await fetch(`/api/forms/${formId}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to validate form: ${response.statusText}`);
    }

    const result = await response.json();
    return result.errors || {};
  } catch (error) {
    console.error('Error validating form on server:', error);
    throw error;
  }
}

/**
 * Cache for form configurations
 */
class FormConfigCache {
  private cache: Map<string, { config: FormConfig; timestamp: number }> = new Map();
  private ttl: number = 5 * 60 * 1000; // 5 minutes default TTL

  set(formId: string, config: FormConfig): void {
    this.cache.set(formId, {
      config,
      timestamp: Date.now(),
    });
  }

  get(formId: string): FormConfig | null {
    const cached = this.cache.get(formId);
    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(formId);
      return null;
    }

    return cached.config;
  }

  clear(): void {
    this.cache.clear();
  }

  setTTL(ttl: number): void {
    this.ttl = ttl;
  }
}

export const formConfigCache = new FormConfigCache();

/**
 * Fetch form configuration with caching
 * @param formId - The ID of the form to fetch
 * @param useCache - Whether to use cached config (default: true)
 * @returns Promise resolving to the form configuration
 */
export async function fetchFormConfigCached(
  formId: string,
  useCache: boolean = true
): Promise<FormConfig> {
  if (useCache) {
    const cached = formConfigCache.get(formId);
    if (cached) return cached;
  }

  const config = await fetchFormConfig(formId);
  formConfigCache.set(formId, config);
  return config;
}
