import { AppDetailedInfo } from '@cloud-editor-mono/infrastructure';
import {
  AddConsoleSource,
  AppendDataToSource,
  AppLabAction,
  AppLabActionStatus,
  ConsoleSourceKey,
  ConsoleSources,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { Subject } from 'rxjs';

export type AppsStatus = {
  defaultApp?: AppDetailedInfo;
  runningApp?: AppDetailedInfo;
  activeApp?: AppDetailedInfo;
  failedApp?: AppDetailedInfo; // currently not used
};

export type RuntimeActions = {
  runAction: (
    app: AppDetailedInfo,
    displaySwapDialog?: (e: boolean) => void,
  ) => void;
  stopAction: (app: AppDetailedInfo) => void;
  swapAction: (app: AppDetailedInfo) => void;
  resetCurrentAction: () => void;
  currentAction: AppLabAction | null;
  currentActionStatus: AppLabActionStatus;
  progress: number; // currently not used
};

export type ConsoleLogic = {
  consoleSourcesResetSubject: Subject<void>;
  consoleSources: ConsoleSources;
  consoleTabs: ConsoleSourceKey[];
  activeConsoleTab?: ConsoleSourceKey;
  setActiveConsoleTab: React.Dispatch<
    React.SetStateAction<ConsoleSourceKey | undefined>
  >;
  appendData: AppendDataToSource;
  addConsoleSource: AddConsoleSource;
  resetConsoleSources: (keysToRetain: string[]) => void;
  consoleSourcesOwner?: string;
};

export type UseRuntimeLogic = () => {
  appsStatus: AppsStatus;
  runtimeActions: RuntimeActions;
  consoleLogic: ConsoleLogic;
};
