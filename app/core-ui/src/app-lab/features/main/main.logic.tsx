import {
  boardNeedsImageUpdate,
  boardNeedsOSUpdate,
  login,
  logout,
  openLinkExternal,
  reloadApp,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import {
  BoardUpdateDialogLogic,
  FlashBoardDialogLogic,
  SidePanelItemInterface,
  sidePanelItems,
  SidePanelLogic,
  SidePanelSectionId,
  UpdaterStatus,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { useLocation } from '@tanstack/react-router';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

import { useIsBoard } from '../../hooks/board';
import { useUpdater } from '../../hooks/updater';
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
      const activeItem = pathname
        .split('/')
        .filter((it) => it.length > 0)
        .shift();

      const { items: sidePanelItemsBySection } = useMemo(
        () =>
          sidePanelItems.reduce(
            (acc, item) => {
              const { sectionId, enabled } = item;

              item.active = activeItem === item.id;

              if (!sectionId || !enabled) {
                return acc;
              }
              if (!acc.items[sectionId]) {
                acc.items[sectionId] = [];
              }
              acc.items[sectionId].push(item);
              return acc;
            },
            {
              items: {} as Record<SidePanelSectionId, SidePanelItemInterface[]>,
            },
          ),
        [activeItem],
      );

      return {
        sidePanelItemsBySection,
        activeItem,
        user: undefined,
        visible: pathname.split('/').length <= 2,
        login,
        logout,
      };
    };
    const sidePanelLogic = useCallback(useSidePanelLogic, []);

    const useBoardUpdateDialogLogic =
      (): ReturnType<BoardUpdateDialogLogic> => {
        const [open, setOpen] = useState(false);

        const {
          isError: getPropsError,
          isSuccess: getPropsSuccess,
          isSetupDone,
        } = useSystemPropsStore();

        const {
          status,
          canStartUpdate,
          boardUpdates,
          boardLogErrors,
          boardLogs,
          newAppVersion,
          checkForUpdates,
          startUpdate,
          skipUpdate: updaterSkipUpdate,
          boardUpdateSucceeded,
          appUpdateSucceeded,
          bypassSkipUpdate,
        } = useUpdater();

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

        useEffect(() => {
          if (canStartUpdate && status === UpdaterStatus.None) {
            checkForUpdates();
          }
        }, [canStartUpdate, checkForUpdates, status]);

        const logStatus = useMemo(() => {
          if (
            [UpdaterStatus.CheckingFailed, UpdaterStatus.UpdateFailed].includes(
              status,
            )
          ) {
            return 'failed';
          }

          if ([UpdaterStatus.UpdateComplete].includes(status)) {
            return 'success';
          }

          return 'pending';
        }, [status]);

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
          boardLogErrors,
          newAppVersion,
          logStatus,
          startUpdate,
          reloadApp,
          openFlasherTool,
          openArduinoSupport,
          skipUpdate,
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
    };
  };
