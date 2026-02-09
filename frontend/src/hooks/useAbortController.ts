import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage AbortController for cancelling API requests.
 * Automatically aborts all pending requests when the component unmounts.
 *
 * This prevents memory leaks and "Can't perform a React state update on an unmounted component" warnings.
 *
 * @returns Object with getSignal method to get a new AbortSignal for each request
 *
 * @example
 * const { getSignal } = useAbortController();
 *
 * useEffect(() => {
 *   const fetchData = async () => {
 *     try {
 *       const data = await api.tasks.list(getSignal());
 *       setTasks(data);
 *     } catch (error: any) {
 *       if (error.name === 'AbortError' || error.name === 'CanceledError') {
 *         // Request was cancelled, ignore
 *         return;
 *       }
 *       // Handle other errors
 *       setError(error.message);
 *     }
 *   };
 *   fetchData();
 * }, []);
 */
export function useAbortController() {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Create a new AbortController when component mounts
    abortControllerRef.current = new AbortController();

    // Cleanup: abort all pending requests when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Get the AbortSignal for the current AbortController.
   * Use this signal when making API requests.
   */
  const getSignal = (): AbortSignal | undefined => {
    return abortControllerRef.current?.signal;
  };

  /**
   * Manually abort all pending requests.
   * Useful when you want to cancel requests before unmount.
   */
  const abort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      // Create a new controller for future requests
      abortControllerRef.current = new AbortController();
    }
  };

  return { getSignal, abort };
}

export default useAbortController;
