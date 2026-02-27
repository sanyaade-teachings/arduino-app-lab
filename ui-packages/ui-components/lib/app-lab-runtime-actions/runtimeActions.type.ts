import { AppDetailedInfo, AppStatus } from '@cloud-editor-mono/infrastructure';

export type RuntimeActionsLogic = () => {
  appId: string;
  appName?: string;
  appDefault?: AppDetailedInfo;
  appStatus: AppStatus;
  currentAction: AppLabAction | null;
  currentActionStatus: AppLabActionStatus;
  setAsDefaultApp?: (isSelected: boolean) => void;
  openApp?: (app: AppDetailedInfo) => void;
  runApp: (appId: string) => void;
  stopApp: (appId: string, appStatus: AppStatus) => void;
  isBannerEnabled?: boolean;
  showStop?: boolean;
};

export interface RuntimeActionsProps {
  runtimeActionsLogic: RuntimeActionsLogic;
  runtimeDisable?: boolean;
}

export enum AppLabActionStatus {
  Errored = 'errored',
  Succeeded = 'succeeded',
  Pending = 'pending',
  Idle = 'idle',
}

export enum AppLabAction {
  Run = 'run',
  Stop = 'stop',
  Logs = 'logs',
}
