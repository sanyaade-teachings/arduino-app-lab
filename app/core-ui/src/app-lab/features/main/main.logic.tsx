import {
  boardNeedsImageUpdate,
  boardNeedsOSUpdate,
  getReleaseImageSrc,
  getReleaseNotes,
  openLinkExternal,
  reloadApp,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import {
  BoardUpdateDialogLogic,
  FlashBoardDialogLogic,
  SidePanelItemId,
  SidePanelItemInterface,
  sidePanelItems,
  SidePanelLogic,
  SidePanelSectionId,
  snackbar,
  UpdaterStatus,
  WhatsNewAdHocLogic,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from '@tanstack/react-router';
import { get, set } from 'idb-keyval';
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useIsBoard } from '../../hooks/useIsBoard';
import { useUpdater } from '../../hooks/useUpdater';
import { AuthContext } from '../../providers/auth/authContext';
import { NetworkContext } from '../../providers/network/networkContext';
import { SetupContext } from '../../providers/setup/setupContext';
import { useBoardLifecycleStore } from '../../store/boards/boards';
import { useSystemPropsStore } from '../../store/systemProps';
import { UseMainLogic } from './main.type';

export const DIALOG_SKIPPED_KEY = 'arduino:app-lab:skipped-image-warning';
export type DialogSkippedStore = { [key: string]: boolean };

const FLASHER_TOOL_URL = 'https://www.arduino.cc/en/software/#flasher-tool';
const ARDUINO_SUPPORT_URL = 'https://www.arduino.cc/en/contact-us/';
const FLASHER_TUTORIAL_URL =
  'https://docs.arduino.cc/tutorials/uno-q/update-image/';

export const useMainLogic: UseMainLogic =
  function (): ReturnType<UseMainLogic> {
    const useSidePanelLogic = (): ReturnType<SidePanelLogic> => {
      const { pathname } = useLocation();

      const { user } = useContext(AuthContext);

      const activeItem = pathname
        .split('/')
        .filter((it) => it.length > 0)
        .shift();

      const { items: sidePanelItemsBySection } = useMemo(
        () =>
          sidePanelItems.reduce(
            (acc, item) => {
              const { sectionId, enabled } = item;

              if (!sectionId || !enabled) {
                return acc;
              }
              const currentItem = { ...item };

              currentItem.active = activeItem === item.id;

              if (!acc.items[sectionId]) {
                acc.items[sectionId] = [];
              }

              if (currentItem.id === SidePanelItemId.Account && user) {
                currentItem.Icon = user.picture;
              }

              acc.items[sectionId].push(currentItem);
              return acc;
            },
            {
              items: {} as Record<SidePanelSectionId, SidePanelItemInterface[]>,
            },
          ),
        [activeItem, user],
      );

      return {
        sidePanelItemsBySection,
        activeItem,
        user,
        visible: pathname.split('/').length <= 2,
      };
    };
    const sidePanelLogic = useCallback(useSidePanelLogic, []);

    // Temp. to be removed in versions following 0.5.0
    const useWhatsNewAdHocLogic = (): ReturnType<WhatsNewAdHocLogic> => {
      const [open, setOpen] = useState(false);
      const [releaseNotes, setReleaseNotes] = useState<{
        content: string;
        image: string;
      }>();

      const queryClient = useQueryClient();

      const { mutate: dismissWhatsNew } = useMutation({
        mutationFn: () => set('whats-new-adhoc', true),
        onSuccess: () => {
          queryClient.invalidateQueries(['whats-new-adhoc']);
        },
      });

      const { data: isWhatsNewDismissed, isLoading: isWhatsNewIsLoading } =
        useQuery(['whats-new-adhoc'], async () => {
          const data = await get('whats-new-adhoc');
          return data ?? null;
        });

      const whatsNewFetched = useRef(false);
      useEffect(() => {
        if (
          isWhatsNewDismissed ||
          isWhatsNewDismissed === undefined ||
          isWhatsNewIsLoading ||
          whatsNewFetched.current
        )
          return;

        const _getReleaseNotes = async (): Promise<void> => {
          const version = '0.5.0_';
          try {
            const response = await getReleaseNotes(version);
            setReleaseNotes({
              content: response,
              image: getReleaseImageSrc(version),
            });
            setOpen(true);
          } catch (e) {
            console.error('Error fetching release notes', e);
            setReleaseNotes(undefined);
          }
        };

        _getReleaseNotes();
        whatsNewFetched.current = true;
      }, [isWhatsNewDismissed, isWhatsNewIsLoading]);

      const onClose = useCallback(() => {
        setOpen(false);
        dismissWhatsNew();
      }, [dismissWhatsNew]);

      return {
        open,
        onClose,
        releaseNotes,
      };
    };

    const whatsNewAdHocLogic = useCallback(useWhatsNewAdHocLogic, []);

    const useBoardUpdateDialogLogic =
      (): ReturnType<BoardUpdateDialogLogic> => {
        const [open, setOpen] = useState(false);

        const { setSetupCompleted, setNetworkStepSkipped } =
          useContext(SetupContext);

        const {
          isError: getPropsError,
          isSuccess: getPropsSuccess,
          isSetupDone,
        } = useSystemPropsStore();

        const {
          status,
          canStartUpdate,
          boardUpdates,
          boardLogs,
          newAppVersion,
          releaseNotes,
          checkForUpdates,
          startUpdate,
          skipUpdate: updaterSkipUpdate,
          boardUpdateSucceeded,
          appUpdateSucceeded,
          bypassSkipUpdate,
          setStatus: setUpdaterStatus,
          setBoardLogs: setBoardUpdaterLogs,
        } = useUpdater();

        const {
          disconnectFromNetwork,
          setSelectedNetwork,
          setManualNetworkSetup,
        } = useContext(NetworkContext);

        const changeNetwork = useCallback(async (): Promise<void> => {
          try {
            await disconnectFromNetwork();
          } catch (e) {
            console.error(`Failed to disconnect from network: ${e}`);
            snackbar({
              message: 'Failed to disconnect current network. Update skipped.',
              variant: 'error',
            });
          } finally {
            setUpdaterStatus(UpdaterStatus.None);
            setBoardUpdaterLogs([]);
            setOpen(false);

            setSetupCompleted(false);

            setNetworkStepSkipped(false);
            setSelectedNetwork(undefined);
            setManualNetworkSetup(false);
          }
        }, [
          disconnectFromNetwork,
          setUpdaterStatus,
          setBoardUpdaterLogs,
          setSetupCompleted,
          setNetworkStepSkipped,
          setSelectedNetwork,
          setManualNetworkSetup,
        ]);

        const { data: isBoard } = useIsBoard();

        const isCheckUpdateBlocking =
          getPropsError || (getPropsSuccess && !isSetupDone());

        useLayoutEffect(() => {
          if (
            status === UpdaterStatus.None ||
            status === UpdaterStatus.Skipped ||
            status === UpdaterStatus.AlreadyUpToDate ||
            (status === UpdaterStatus.Checking && !isCheckUpdateBlocking)
          ) {
            setOpen(false);
          } else {
            setOpen(true);
          }
        }, [status, isCheckUpdateBlocking]);

        const { networkStepSkipped } = useContext(SetupContext);
        useEffect(() => {
          if (
            canStartUpdate &&
            status === UpdaterStatus.None &&
            !networkStepSkipped
          ) {
            checkForUpdates();
          }
        }, [canStartUpdate, checkForUpdates, networkStepSkipped, status]);

        const openFlasherTool = async (): Promise<void> => {
          openLinkExternal(FLASHER_TOOL_URL);
        };

        const openArduinoSupport = async (): Promise<void> => {
          openLinkExternal(ARDUINO_SUPPORT_URL);
        };

        const skipUpdate = useCallback((): void => {
          updaterSkipUpdate();
          setOpen(false);
        }, [updaterSkipUpdate]);

        return {
          open,
          isBoard,
          status,
          boardUpdates,
          boardLogs,
          newAppVersion,
          releaseNotes,
          startUpdate,
          reloadApp,
          openFlasherTool,
          openArduinoSupport,
          skipUpdate,
          changeNetwork,
          boardUpdateSucceeded,
          appUpdateSucceeded,
          bypassSkipUpdate,
        };
      };

    const boardUpdateDialogLogic = useCallback(useBoardUpdateDialogLogic, []);

    const useFlashBoardDialogLogic = (): ReturnType<FlashBoardDialogLogic> => {
      const [open, setOpen] = useState(false);

      const { data: isBoard } = useIsBoard();
      const { selectedConnectedBoard, boardIsFlashing, setBoardIsFlashing } =
        useBoardLifecycleStore();

      useEffect(() => {
        const setNeedsOSUpdateAsync = async (): Promise<void> => {
          const isR0Build = await boardNeedsImageUpdate();
          if (!isR0Build) return;

          const needsUpdate = await boardNeedsOSUpdate();
          setOpen(needsUpdate);
        };

        if (
          isBoard === false &&
          selectedConnectedBoard &&
          boardIsFlashing === undefined
        ) {
          setNeedsOSUpdateAsync();
        }
      }, [selectedConnectedBoard, boardIsFlashing, isBoard]);

      return {
        open,
        onOpenChange: setOpen,
        confirmAction: (): void => {
          setBoardIsFlashing(true);
        },
        openFlasherTutorial: (): void => {
          openLinkExternal(FLASHER_TUTORIAL_URL);
        },
      };
    };

    const flashBoardDialogLogic = useCallback(useFlashBoardDialogLogic, []);

    return {
      sidePanelLogic,
      boardUpdateDialogLogic,
      flashBoardDialogLogic,
      whatsNewAdHocLogic,
    };
  };
