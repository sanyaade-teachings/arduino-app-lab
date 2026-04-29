import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect } from 'react';

export function useNotFound(
  shouldRedirect: boolean,
  section: string,
  customRedirect?: string,
): void {
  const navigate = useNavigate();

  const navigateToNotFound = useCallback(() => {
    const redirectPath = customRedirect || `/${section}`;
    navigate({ to: redirectPath });
  }, [navigate, section, customRedirect]);

  useEffect(() => {
    if (shouldRedirect) {
      navigateToNotFound();
    }
  }, [shouldRedirect, navigateToNotFound]);
}

export const useNotFoundHandler = () => {
  const navigate = useNavigate();

  const handleNotFound = useCallback(
    (
      isLoading: boolean,
      resource: { id?: string } | null | undefined,
      section: string,
      customRedirect?: string,
    ) => {
      const isLoaded = !isLoading;
      const notFound = isLoaded && !resource?.id;

      if (notFound) {
        const redirectPath = customRedirect || `/${section}`;
        navigate({ to: redirectPath });
      }
    },
    [navigate],
  );

  return {
    handleNotFound,
  };
};
