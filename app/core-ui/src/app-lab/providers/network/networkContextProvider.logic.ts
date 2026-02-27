import {
  connectToWiFi,
  disconnectWiFi,
  getEthernetStatus,
  getInternetStatus,
  getNetworkList,
  getWiFiStatus,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import {
  NetworkCredentials,
  NetworkItem,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useState } from 'react';

import { useBoardLifecycleStore } from '../../store/boards/boards';
import { SetupContext } from '../setup/setupContext';
import { NetworkContextValue } from './networkContext';

export function useNetwork(): NetworkContextValue {
  const queryClient = useQueryClient();

  const {
    mutate: connectToWifiNetwork,
    isLoading: connectRequestIsLoading,
    isSuccess: connectRequestIsSuccess,
    isError: connectRequestIsError,
    reset: resetConnectRequest,
  } = useMutation({
    mutationKey: ['connect-to-wifi-network'],
    mutationFn: async ({ name, password }: NetworkCredentials) => {
      await connectToWiFi(name, password);
    },
    onMutate: () => {
      queryClient.setQueryData(['wifi-status'], 'connecting');
    },
    onSuccess: () => {
      queryClient.setQueryData(['wifi-status'], 'connected');
    },
    onError: () => {
      queryClient.setQueryData(['wifi-status'], 'disconnected');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['wifi-status'],
      });
    },
  });

  const { boardIsReachable } = useBoardLifecycleStore();

  const {
    mutateAsync: disconnectFromNetwork,
    isLoading: disconnectRequestIsLoading,
  } = useMutation({
    mutationFn: async () => {
      return disconnectWiFi();
    },
    onMutate: () => {
      resetConnectRequest();
      queryClient.setQueryData(['wifi-status'], 'disconnected');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['wifi-status'],
      });
      queryClient.invalidateQueries({
        queryKey: ['internet-status'],
      });
    },
  });

  const {
    data: wiFiStatus,
    isLoading: isWiFiStatusLoading,
    isSuccess: wiFiStatusChecked,
  } = useQuery(['wifi-status'], async () => getWiFiStatus(), {
    retry: 3,
    refetchInterval: 3000,
    enabled:
      boardIsReachable &&
      !connectRequestIsLoading &&
      !disconnectRequestIsLoading,
  });

  const {
    data: ethernetStatus,
    isLoading: isEthernetStatusLoading,
    isSuccess: ethernetStatusChecked,
  } = useQuery(['ethernet-status'], async () => getEthernetStatus(), {
    retry: 3,
    refetchInterval: 3000,
    enabled:
      boardIsReachable &&
      !connectRequestIsLoading &&
      !disconnectRequestIsLoading,
  });

  const networkDeviceConnected =
    wiFiStatus === 'connected' || ethernetStatus === 'connected';

  const {
    data: internetIsReachable,
    isLoading: isInternetStatusLoading,
    isSuccess: internetStatusChecked,
  } = useQuery(['internet-status'], async () => getInternetStatus(), {
    retry: 3,
    refetchInterval: 3000,
    enabled: networkDeviceConnected,
  });

  const [scanCount, setScanCount] = useState(0);
  const { networkStepSkipped } = useContext(SetupContext);
  const isConnected = networkDeviceConnected && internetIsReachable === true;
  const scanningIsEnabled =
    boardIsReachable && !isConnected && !networkStepSkipped;
  const {
    data: networkList,
    isFetching: isScanning,
    refetch: scanNetworkList,
  } = useQuery(['networkList'], getNetworkList, {
    onSuccess: (data) => {
      const list = data || [];
      setScanCount(list.length > 0 ? 8 : (c): number => c + 1);
    },
    enabled: scanningIsEnabled,
    refetchInterval: scanningIsEnabled && scanCount < 8 ? 1500 : false,
  });

  const isStatusConnecting =
    wiFiStatus === 'connecting' || ethernetStatus === 'connecting';

  const [selectedNetwork, setSelectedNetwork] = useState<NetworkItem>();
  const [manualNetworkSetup, setManualNetworkSetup] = useState(false);

  return {
    isScanning: isScanning || (scanningIsEnabled && scanCount < 8),
    networkList: networkList || [],
    isNetworkStatusLoading:
      isWiFiStatusLoading || isEthernetStatusLoading || isInternetStatusLoading,
    networkStatusChecked:
      wiFiStatusChecked &&
      ethernetStatusChecked &&
      (!networkDeviceConnected || internetStatusChecked), // internetStatusChecked only matters if there is a network connection
    scanNetworkList,
    connectToWifiNetwork,
    disconnectFromNetwork,
    isConnected,
    isStatusConnecting,
    isConnecting:
      connectRequestIsLoading ||
      isStatusConnecting ||
      (connectRequestIsSuccess && !internetIsReachable),
    connectRequestIsSuccess,
    connectRequestIsError,
    selectedNetwork,
    setSelectedNetwork,
    manualNetworkSetup,
    setManualNetworkSetup,
  };
}
