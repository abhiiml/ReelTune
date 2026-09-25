import { supabase } from './supabase';

const RAW_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
export const getBaseUrl = (): string => RAW_URL.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
export const API_URL = `${getBaseUrl()}/api/v1`;

export const fetchApi = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(', ');
      } else {
        errorMessage = errorData.message || errorMessage;
      }
    } catch (e) {
      errorMessage = await response.text();
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  
  // Unwrap { value: [...] } if backend sends .NET style or wrapped responses
  if (result && typeof result === 'object' && 'value' in result) {
    return result.value;
  }
  
  return result;
};
