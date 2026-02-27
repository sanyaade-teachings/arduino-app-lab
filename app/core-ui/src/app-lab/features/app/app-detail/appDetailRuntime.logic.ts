import {
  getAppLogs,
  getSerialMonitorLogs,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import {
  AppDetailedInfo,
  BrickCreateUpdateRequest,
  BrickInstance,
  MessageData,
  UpdateAppDetailRequest,
} from '@cloud-editor-mono/infrastructure';
import {
  AppLabActionStatus,
  AppLabTabsLogic,
  BoardResourcesValue,
  ConfigureAppBricksDialogLogic,
  CONSOLE_SOURCE_KEYS,
  ConsoleLogValue,
  ContentUpdateLogic,
  MultipleConsolePanelLogic,
  RuntimeActionsLogic,
  SerialMonitorLogic,
  SerialMonitorStatus,
  SwapRunningAppDialogLogic,
  TreeNode,
  UseArduinoAccountLogic,
  UseEdgeImpulseAccountLogic,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePreviousDistinct } from 'react-use';
import { BehaviorSubject, Subject } from 'rxjs';

import { AuthContext } from '../../../providers/auth/authContext';
import { BoardResourcesContext } from '../../../providers/board-resources/boardResourcesContext';
import { EdgeImpulseContext } from '../../../providers/edge-impulse/edgeImpulseContext';
import { RuntimeContext } from '../../../providers/runtime/runtimeContext';
import { useBoardLifecycleStore } from '../../../store/boards/boards';
import { useAppSSE } from './hooks/useAppSSE';
import { useAppWebSocket } from './hooks/useAppWebSocket';
import { checkIfHasIno, checkIfHasPython } from './utils/checkFileTypes';

export type UseAppDetailRuntimeLogic = (
  app?: AppDetailedInfo,
  appBricks?: BrickInstance[],
  fileTree?: TreeNode[],
  openApp?: (app: AppDetailedInfo) => void,
  updateApp?: (request: UpdateAppDetailRequest) => Promise<boolean>,
  updateAppBricks?: (
    bricks: Record<string, BrickCreateUpdateRequest>,
  ) => Promise<boolean>,
) => {
  activePanel: 'editor' | 'console';
  appLabTabsLogic: AppLabTabsLogic<'editor' | 'console'>;
  configureAppBricksDialogLogic: ConfigureAppBricksDialogLogic;
  swapRunningAppDialogLogic: SwapRunningAppDialogLogic;
  multipleConsolePanelLogic: MultipleConsolePanelLogic;
  runtimeActionsLogic: RuntimeActionsLogic;
};

export const useAppDetailRuntimeLogic: UseAppDetailRuntimeLogic = function (
  app?: AppDetailedInfo,
  appBricks?: BrickInstance[],
  fileTree?: TreeNode[],
  openApp?: (app: AppDetailedInfo) => void,
  updateApp?: (request: UpdateAppDetailRequest) => Promise<boolean>,
  updateAppBricks?: (
    bricks: Record<string, BrickCreateUpdateRequest>,
  ) => Promise<boolean>,
): ReturnType<UseAppDetailRuntimeLogic> {
  const [open, setOpen] = useState(false);

  const panels = useMemo(() => ['editor', 'console'] as const, []);
  const [activePanel, setActivePanel] =
    useState<typeof panels[number]>('editor');

  const appLabTabsLogic: AppLabTabsLogic<typeof panels[number]> = useCallback(
    () => ({
      tabs: panels,
      activeTab: activePanel,
      setTab: setActivePanel,
    }),
    [activePanel, panels],
  );

  const [configureAppBricksDialogOpen, setConfigureAppBricksDialogOpen] =
    useState(false);

  const { selectedConnectedBoard: selectedBoard } = useBoardLifecycleStore();
  const {
    appsStatus: { defaultApp, activeApp },
    runtimeActions: {
      currentAction,
      currentActionStatus,
      resetCurrentAction,
      runAction,
      stopAction,
      swapAction,
    },
    consoleLogic: {
      consoleSources,
      consoleSourcesResetSubject: resetSource,
      consoleTabs,
      activeConsoleTab,
      setActiveConsoleTab,
      appendData,
      addConsoleSource,
      resetConsoleSources,
      consoleSourcesOwner,
    },
  } = useContext(RuntimeContext);

  const runApp = useCallback((): void => {
    if (!app) return;
    if (
      appBricks?.some(
        (brick) =>
          brick.config_variables?.some((v) => v.required && !v.value) ||
          (brick.require_model && !brick.model),
      )
    ) {
      setConfigureAppBricksDialogOpen(true);
    } else {
      runAction(app, setOpen);
      setActivePanel('console');
    }
  }, [app, appBricks, runAction]);

  const onMessageLogs = useCallback(
    (message: MessageData) => {
      if (!message.id) return; //Some bricks are returning empty ids, this line prevents the logging of those
      appendData(message.id, message, true);
    },
    [appendData],
  );
  const {
    connect: getAppLogsStream,
    abort: getAppLogsAbort,
    abortController: getAppLogsAbortController,
  } = useAppSSE({
    appSSE: getAppLogs,
    onMessage: onMessageLogs,
  });

  const createMonitorSourceOnMsg = useRef(true);
  const onMessageSerial = useCallback(
    (message: string) => {
      const bypassCreate = createMonitorSourceOnMsg.current;
      appendData(
        CONSOLE_SOURCE_KEYS.SERIAL_MONITOR,
        {
          id: CONSOLE_SOURCE_KEYS.SERIAL_MONITOR,
          message,
        },
        bypassCreate,
      );
    },
    [appendData],
  );

  const {
    connect: getSerialMonitorLogsStream,
    abort: getSerialMonitorLogsAbort,
    send: sendSerialMonitorLogsMessage,
    socketRef,
    socketIsConnectingRef,
  } = useAppWebSocket({
    appWebSocket: getSerialMonitorLogs,
    onMessage: onMessageSerial,
  });

  const stopApp = useCallback((): void => {
    if (!app) return;

    createMonitorSourceOnMsg.current = false;
    getSerialMonitorLogsAbort();
    getAppLogsAbort();

    setActivePanel('console');
    stopAction(app);
  }, [app, getAppLogsAbort, getSerialMonitorLogsAbort, stopAction]);

  useEffect(() => {
    if (currentActionStatus !== AppLabActionStatus.Pending) {
      if (!getAppLogsAbortController.current && !socketRef.current) {
        resetCurrentAction();
      }
    }

    if (!app?.id || !fileTree || app.status !== 'running') return;

    const hasPython = fileTree ? checkIfHasPython(fileTree[0]) : false;
    const hasIno = fileTree ? checkIfHasIno(fileTree[0]) : false;

    if (hasPython) {
      addConsoleSource(CONSOLE_SOURCE_KEYS.PYTHON);
      if (!getAppLogsAbortController.current) {
        getAppLogsStream(app.id);
      }
    }

    if (hasIno) {
      createMonitorSourceOnMsg.current = true;
      addConsoleSource(CONSOLE_SOURCE_KEYS.SERIAL_MONITOR);
      if (!socketRef.current && !socketIsConnectingRef.current) {
        getSerialMonitorLogsStream();
      }
    }
  }, [
    addConsoleSource,
    app?.id,
    app?.status,
    currentActionStatus,
    fileTree,
    getAppLogsAbortController,
    getAppLogsStream,
    getSerialMonitorLogsStream,
    resetCurrentAction,
    socketIsConnectingRef,
    socketRef,
  ]);

  useEffect(() => {
    return () => {
      getAppLogsAbort();
      getSerialMonitorLogsAbort();
    };
  }, [getAppLogsAbort, getSerialMonitorLogsAbort]);

  useEffect(() => {
    setActiveConsoleTab(consoleTabs[0]);
  }, [consoleTabs, setActiveConsoleTab]);

  useEffect(() => {
    if (app?.status !== 'running') {
      createMonitorSourceOnMsg.current = false;
      getSerialMonitorLogsAbort();
      getAppLogsAbort();
    }
  }, [app?.id, app?.status, getAppLogsAbort, getSerialMonitorLogsAbort]);

  const prevCurrentAction = usePreviousDistinct(currentAction);
  useEffect(() => {
    const keysToRemain: string[] = [];

    if (currentAction !== null || !!prevCurrentAction) {
      keysToRemain.push(CONSOLE_SOURCE_KEYS.SERIAL_MONITOR);
      keysToRemain.push(CONSOLE_SOURCE_KEYS.PYTHON);
      keysToRemain.push(CONSOLE_SOURCE_KEYS.STARTUP);
    }

    resetConsoleSources(keysToRemain);
  }, [currentAction, prevCurrentAction, resetConsoleSources]);

  const useArduinoAuthAccountLogic = (): ReturnType<UseArduinoAccountLogic> =>
    useContext(AuthContext);
  const arduinoAuthAccountLogic = useCallback(useArduinoAuthAccountLogic, []);

  const useEdgeImpulseAuthAccountLogic =
    (): ReturnType<UseEdgeImpulseAccountLogic> =>
      useContext(EdgeImpulseContext);
  const edgeImpulseAuthAccountLogic = useCallback(
    useEdgeImpulseAuthAccountLogic,
    [],
  );

  const useBoardResourcesLogic = (): BoardResourcesValue =>
    useContext(BoardResourcesContext);
  const boardResourcesLogic = useCallback(useBoardResourcesLogic, []);

  const useConfigureAppBricksDialogLogic =
    (): ReturnType<ConfigureAppBricksDialogLogic> => ({
      bricks: appBricks ?? [],
      open: configureAppBricksDialogOpen,
      onOpenChange: setConfigureAppBricksDialogOpen,
      confirmAction: async (bricks): Promise<boolean> => {
        if (!updateAppBricks) return false;
        const result = await updateAppBricks(bricks);
        if (result) {
          runApp();
        }
        return result;
      },
      arduinoAuthAccountLogic,
      edgeImpulseAuthAccountLogic,
      boardResourcesLogic,
    });

  const configureAppBricksDialogLogic = useCallback(
    useConfigureAppBricksDialogLogic,
    [
      appBricks,
      arduinoAuthAccountLogic,
      configureAppBricksDialogOpen,
      edgeImpulseAuthAccountLogic,
      runApp,
      updateAppBricks,
      boardResourcesLogic,
    ],
  );

  const isActiveApp =
    activeApp?.id === app?.id ||
    consoleSourcesOwner === app?.id ||
    app?.status === 'running';

  const swapRunningAppDialogLogic: SwapRunningAppDialogLogic = useCallback(
    () => ({
      open,
      setOpen,
      handleSwap: (): void => {
        if (!app) return;
        swapAction(app);
        setOpen(false);
      },
    }),
    [app, open, swapAction],
  );

  const serialMonitorLogic: SerialMonitorLogic = useCallback(
    (logSource$: BehaviorSubject<ConsoleLogValue>) => {
      const useContentUpdate: ContentUpdateLogic = (
        receiveContentUpdate: (
          content: string,
          isSentByUser: boolean,
          className?: string,
          isGlobalStyle?: boolean,
        ) => void,
        receiveContentReset: () => void,
        resetSource?: Subject<void>,
      ): void => {
        useEffect(() => {
          const s = logSource$?.subscribe({
            next(message: ConsoleLogValue) {
              receiveContentUpdate(
                message.value,
                false,
                message?.meta?.className,
                message?.meta?.isGlobalStyle,
              );
            },
            error(e: Error) {
              console.error(e);
              receiveContentReset();
            },
          });
          return () => s?.unsubscribe();
        }, [receiveContentUpdate, receiveContentReset]);

        useEffect(() => {
          const s = resetSource?.subscribe(receiveContentReset);
          return () => s?.unsubscribe();
        }, [receiveContentReset, resetSource]);
      };

      return {
        contentUpdateLogic: useContentUpdate,
        baudRates: [9600],
        selectedBaudRate: 9600,
        onBaudRateSelected: (baudRate: number): void => {
          console.log(`New baudrate: ${baudRate} selected`);
        },
        onPlayPause: (): void => {
          console.log('Play/Pause triggered');
        },
        clearMessages: (): void => {
          console.log(`Clear message triggered`);
        },
        status: SerialMonitorStatus.Active,
        disabled: false,
        onMessageSend: sendSerialMonitorLogsMessage,
      };
    },
    [sendSerialMonitorLogsMessage],
  );

  const multipleConsolePanelLogic: MultipleConsolePanelLogic = useCallback(
    () => ({
      showLogs: isActiveApp,
      consoleTabs,
      consoleSources,
      activeTab: activeConsoleTab,
      setActiveTab: setActiveConsoleTab,
      resetSource,
      selectedBoard,
      serialMonitorLogic,
    }),
    [
      activeConsoleTab,
      consoleSources,
      consoleTabs,
      isActiveApp,
      resetSource,
      selectedBoard,
      setActiveConsoleTab,
      serialMonitorLogic,
    ],
  );

  const runtimeActionsLogic: RuntimeActionsLogic = useCallback(
    () => ({
      appId: app?.id || '',
      appDefault: defaultApp,
      appName: app?.name || '',
      appStatus: app?.status || 'stopped',
      currentAction,
      currentActionStatus,
      openApp,
      runApp,
      stopApp,
      setAsDefaultApp: async (isSelected: boolean): Promise<void> => {
        await updateApp?.({
          default: isSelected,
        });
      },
      showStop: isActiveApp,
      isBannerEnabled: isActiveApp,
    }),
    [
      app?.id,
      app?.name,
      app?.status,
      currentAction,
      currentActionStatus,
      defaultApp,
      isActiveApp,
      openApp,
      runApp,
      stopApp,
      updateApp,
    ],
  );

  return {
    activePanel,
    appLabTabsLogic,
    configureAppBricksDialogLogic,
    swapRunningAppDialogLogic,
    multipleConsolePanelLogic,
    runtimeActionsLogic,
  };
};
