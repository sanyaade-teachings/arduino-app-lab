import {
  getConnectionName,
  getIPAddress,
  getKernelVersion,
  getLinuxDistribution,
  getOSImageVersion,
  isNetworkModeEnabled,
  openLinkExternal,
  setNetworkMode,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import {
  snackbar,
  UseBoardSettingsLogic,
  useI18n,
  UseNetworkModeLogic,
  UseNetworkSettingsLogic,
  UsePasswordSettingsLogic,
  UseSettingsLogic,
  UseSystemSettingsLogic,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useIsBoard } from '../../hooks/useIsBoard';
import { BoardConfigurationContext } from '../../providers/board-configuration/boardConfigurationContext';
import { BoardResourcesContext } from '../../providers/board-resources/boardResourcesContext';
import { bytesToGiB } from '../../providers/board-resources/boardResourcesContextProvider.logic';
import { LinuxCredentialsContext } from '../../providers/linux-credentials/linuxCredentialsContext';
import { NetworkContext } from '../../providers/network/networkContext';
import { UpdaterContext } from '../../providers/updater/updaterContext';
import { useBoardLifecycleStore } from '../../store/boardLifecycle';
import { systemMessages } from './messages';

export const createUseSettingsLogic = function(): UseSettingsLogic {
  return function useSettingsLogic(): ReturnType<UseSettingsLogic> {
    const queryClient = useQueryClient();
    const { data: isBoard } = useIsBoard();
    const {
      selectedConnectedBoard,
      boardIsReachable,
      needsImageUpdate,
      setBoardIsFlashing,
    } = useBoardLifecycleStore(
      useShallow((state) => ({
        selectedConnectedBoard: state.selectedConnectedBoard,
        boardIsReachable: state.boardIsReachable,
        needsImageUpdate: state.needsImageUpdate,
        setBoardIsFlashing: state.setBoardIsFlashing,
      })),
    );

    const usePasswordSettingsLogic =
      (): ReturnType<UsePasswordSettingsLogic> => {
        const [open, setOpen] = useState(false);
        const {
          setUserPassword,
          setUserPasswordIsLoading: isLoading,
          setUserPasswordConfirmationIsError: confirmationIsError,
          setUserPasswordIsError: isError,
          setUserPasswordIsSuccess: isSuccess,
          userPasswordErrorMsg: errorMsg,
          userPasswordConfirmationErrorMsg: confirmationErrorMsg,
        } = useContext(LinuxCredentialsContext);

        return {
          setUserPassword,
          isLoading,
          confirmationIsError,
          isError,
          isSuccess,
          errorMsg,
          confirmationErrorMsg,
          open,
          onOpenChange: setOpen,
          openChangePasswordDialog: () => setOpen(true),
        };
      };

    const useBoardSettingsLogic = (): ReturnType<UseBoardSettingsLogic> => {
      const { resources } = useContext(BoardResourcesContext);
      const {
        keyboardLayout,
        keyboardLayouts,
        boardName,
        setBoardName,
        setKeyboardLayout,
      } = useContext(BoardConfigurationContext);

      return {
        isBoard: !!isBoard,
        board: selectedConnectedBoard,
        boardName,
        boardResources: resources,
        keyboardLayout: keyboardLayouts.find(
          (layout) => layout.id === keyboardLayout,
        ),
        keyboardLayouts,
        bytesToGiB,
        setBoardName,
        setKeyboardLayout,
      };
    };

    const useNetworkModeLogic = (): ReturnType<UseNetworkModeLogic> => {
      const { formatMessage } = useI18n();

      const [open, setOpen] = useState(false);

      const { data: networkModeEnabled } = useQuery(
        ['network-mode-enabled'],
        async () => isNetworkModeEnabled(),
        {
          enabled: boardIsReachable,
        },
      );

      const {
        error: networkModeError,
        isError: isNetworkModeError,
        isLoading: isSettingNetworkMode,
        isSuccess: isSettingNetworkModeSuccess,
        mutateAsync: updateNetworkMode,
      } = useMutation({
        mutationFn: (prop: { enabled: boolean; password: string }) =>
          setNetworkMode(prop.enabled, prop.password),
        onSuccess: (enabled: boolean) => {
          queryClient.setQueryData(['network-mode-enabled'], enabled);
          snackbar({
            message: formatMessage(systemMessages.remoteAccessToggle, {
              enabled: enabled ? 'enabled' : 'disabled',
            }),
            variant: 'success',
          });
        },
        onSettled: () => {
          queryClient.invalidateQueries(['network-mode-enabled']);
        },
      });

      return {
        open,
        onOpenChange: setOpen,
        isNetworkModeEnabled: networkModeEnabled,
        onConfirm: (password: string) =>
          updateNetworkMode({ enabled: !networkModeEnabled, password }),
        isLoading: isSettingNetworkMode,
        isSuccess: isSettingNetworkModeSuccess,
        error: isNetworkModeError
          ? (Array.isArray(networkModeError)
            ? networkModeError
            : [String(networkModeError)]
          ).some((error) => error.includes('password'))
            ? 'password'
            : 'generic'
          : undefined,
      };
    };

    const useNetworkSettingsLogic = (): ReturnType<UseNetworkSettingsLogic> => {
      const [open, setOpen] = useState(false);
      const networkContext = useContext(NetworkContext);

      useEffect(() => {
        networkContext.setManualNetworkSetup(false);
        networkContext.setSelectedNetwork(undefined);
        networkContext.setScanningIsEnabled(open);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [open]);

      useEffect(() => {
        if (networkContext.connectRequestIsSuccess) {
          setOpen(false);
        }
      }, [networkContext.connectRequestIsSuccess]);

      const { data: selectedConnectedNetwork } = useQuery(
        ['connection-name'],
        async () => getConnectionName(),
        {
          enabled: boardIsReachable && networkContext.isConnected,
        },
      );

      const { data: selectedConnectedIPAddress } = useQuery(
        ['ip-address'],
        async () => getIPAddress(),
        {
          enabled: boardIsReachable && networkContext.isConnected,
        },
      );

      return {
        ...networkContext,
        selectedConnectedNetwork,
        selectedConnectedIPAddress,
        open,
        onOpenChange: setOpen,
        openNetworkSettingsDialog: () => setOpen(true),
      };
    };

    const useSystemSettingsLogic = (): ReturnType<UseSystemSettingsLogic> => {
      const {
        currentAppVersion,
        canStartUpdate,
        checkForUpdates,
        boardUpdates,
        newAppVersion,
        startUpdate,
      } = useContext(UpdaterContext);

      useEffect(() => {
        if (canStartUpdate) {
          checkForUpdates(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [canStartUpdate]);

      const { data: osImageVersion } = useQuery(
        ['os-image-version'],
        async () => getOSImageVersion(),
        {
          enabled: boardIsReachable,
        },
      );

      const { data: kernelVersion } = useQuery(
        ['kernel-version'],
        async () => getKernelVersion(),
        {
          enabled: boardIsReachable,
        },
      );

      const { data: linuxDistribution } = useQuery(
        ['linux-distribution'],
        async () => getLinuxDistribution(),
        {
          enabled: boardIsReachable,
        },
      );

      const formatReleaseDate = (
        dateString: string | undefined,
      ): string | undefined => {
        if (!dateString) return undefined;

        const year = dateString.slice(0, 4);
        const month = dateString.slice(4, 6);
        const day = dateString.slice(6, 8);

        if (!year || !month || !day) return undefined;
        const date = new Date(`${year}-${month}-${day}`);
        return date.toLocaleDateString();
      };

      return {
        currentAppVersion,
        hasBoardUpdate: !!boardUpdates,
        needsImageUpdate,
        newAppVersion,
        osImageVersion,
        osReleaseDate: formatReleaseDate(osImageVersion?.split('-')[0]),
        kernelVersion,
        linuxDistribution,
        openFlasher: () => setBoardIsFlashing(true),
        startUpdate,
      };
    };

    return {
      boardSettingsLogic: useBoardSettingsLogic,
      networkModeLogic: useNetworkModeLogic,
      networkSettingsLogic: useNetworkSettingsLogic,
      systemSettingsLogic: useSystemSettingsLogic,
      passwordSettingsLogic: usePasswordSettingsLogic,
      onOpenExternal: openLinkExternal,
    };
  };
};
