import {
  edgeImpulseLoginWithBrowser as loginWithBrowser,
  getEIAccessToken as getAccessToken,
  getEIAuthClient,
  isAuthenticatedEI,
  logoutEI as _logout,
  retrieveEIUser as retrieveUser,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EdgeImpulseContextValue } from './edgeImpulseContext';

export function useEdgeImpulse(): EdgeImpulseContextValue {
  const queryClient = useQueryClient();

  const { data: eiClient } = useQuery(['ei-auth-init'], getEIAuthClient);

  const { data: token } = useQuery(
    ['ei-token'],
    async () => {
      try {
        return await getAccessToken();
      } catch (e) {
        return null;
      }
    },
    {
      enabled: !!eiClient,
      refetchOnWindowFocus: true,
      retry: false,
    },
  );

  const getTokenDone = Boolean(token || token === '');

  const { data: userIsAuthenticated } = useQuery(
    ['ei-auth-check'],
    isAuthenticatedEI,
    {
      enabled: getTokenDone,
    },
  );

  const { data: user } = useQuery(
    ['ei-user', token],
    async () => {
      return retrieveUser();
    },
    {
      enabled: getTokenDone && userIsAuthenticated === true,
    },
  );

  const { mutateAsync: login, isLoading: isLoginLoading } = useMutation({
    mutationFn: () => loginWithBrowser(),
    onSuccess: async () => {
      queryClient.invalidateQueries(['ei-token']);
      queryClient.invalidateQueries(['ei-user']);
      queryClient.invalidateQueries(['ei-auth-check']);
    },
  });

  const { mutateAsync: logout } = useMutation({
    mutationFn: async () => {
      return _logout();
    },
    onSuccess: async () => {
      queryClient.setQueryData(['ei-token'], null);
      queryClient.setQueryData(['ei-user', null], null);
      queryClient.setQueryData(['ei-auth-check'], false);
    },
  });

  return {
    user,
    login,
    isLoginLoading,
    logout,
    isAuthenticated: !!userIsAuthenticated,
  };
}
