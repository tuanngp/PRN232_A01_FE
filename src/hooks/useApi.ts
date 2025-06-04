import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { ApiError } from '@/types/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiMutationState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export function useApi<T>(endpoint: string, params?: Record<string, unknown>): UseApiState<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const response = await apiClient.get<T>(endpoint, params);
        setState({ data: response, loading: false, error: null });
      } catch (error) {
        setState({ 
          data: null, 
          loading: false, 
          error: error instanceof Error ? error.message : 'An error occurred' 
        });
      }
    };

    fetchData();
  }, [endpoint, params]);

  return state;
}

export function useApiMutation<TRequest = unknown, TResponse = unknown>() {
  const [state, setState] = useState<UseApiMutationState>({
    loading: false,
    error: null,
    success: false,
  });

  const mutate = async (
    method: 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: TRequest
  ): Promise<TResponse | null> => {
    try {
      setState({ loading: true, error: null, success: false });
      
      let response: TResponse;
      
      switch (method) {
        case 'POST':
          response = await apiClient.post<TResponse>(endpoint, data);
          break;
        case 'PUT':
          response = await apiClient.put<TResponse>(endpoint, data);
          break;
        case 'DELETE':
          response = await apiClient.delete<TResponse>(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      setState({ loading: false, error: null, success: true });
      return response;
    } catch (error) {
      setState({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'An error occurred',
        success: false 
      });
      return null;
    }
  };

  const post = (endpoint: string, data?: TRequest) => mutate('POST', endpoint, data);
  const put = (endpoint: string, data?: TRequest) => mutate('PUT', endpoint, data);
  const remove = (endpoint: string) => mutate('DELETE', endpoint);

  return {
    ...state,
    post,
    put,
    remove,
    mutate,
  };
}

export function useNews(params?: Record<string, unknown>) {
  return useApi('/api/news-articles', params);
}

export function useNewsById(id: number) {
  return useApi(`/api/news-articles/${id}`);
}

export function useCategories() {
  return useApi('/api/categories');
}

export function useTags() {
  return useApi('/api/tags');
}

export function useAccounts() {
  return useApi('/api/system-accounts');
}

export function useNewsMutation() {
  return useApiMutation();
}

export function useCategoryMutation() {
  return useApiMutation();
}

export function useTagMutation() {
  return useApiMutation();
}

export function useAccountMutation() {
  return useApiMutation();
}

export function useNewsSearch(query: string, delay = 300) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  return useApi(`/api/news-articles?$filter=contains(NewsTitle, '${debouncedQuery}')`, {
    enabled: debouncedQuery.length >= 2
  });
}

// Hook for mutations (POST, PUT, DELETE)
export function useMutation<TData, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: ApiError, variables: TVariables) => void;
  } = {}
) {
  const [state, setState] = useState<{
    data: TData | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const { onSuccess, onError } = options;

  const mutate = useCallback(async (variables: TVariables) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await mutationFn(variables);
      setState(prev => ({
        ...prev,
        data,
        loading: false,
      }));

      onSuccess?.(data, variables);
      return data;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        error: apiError.message || 'Có lỗi xảy ra',
        loading: false,
      }));

      onError?.(apiError, variables);
      throw error;
    }
  }, [mutationFn, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
} 