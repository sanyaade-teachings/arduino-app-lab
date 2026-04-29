import {
  Board,
  BoardResources,
  ChangePasswordDialogLogic,
  KeyboardLayout,
  NetworkItem,
  NetworkSettingsDialogLogic,
  PasswordDialogLogic,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';

export type UseBoardSettingsLogic = () => {
  isBoard: boolean;
  board?: Board;
  boardName?: string;
  boardResources?: BoardResources;
  keyboardLayout: KeyboardLayout | undefined;
  keyboardLayouts: KeyboardLayout[];
  bytesToGiB: (bytes: unknown) => string;
  setBoardName: (name: string) => void;
  setKeyboardLayout: (layout: string) => void;
};

export type UseNetworkModeLogic = () => PasswordDialogLogic & {
  isNetworkModeEnabled?: boolean;
};

export type UseNetworkSettingsLogic = () => NetworkSettingsDialogLogic & {
  selectedConnectedNetwork?: NetworkItem | null;
  selectedConnectedIPAddress?: string | null;
  openNetworkSettingsDialog: () => void;
};

export type UseSystemSettingsLogic = () => {
  currentAppVersion?: string;
  hasBoardUpdate: boolean;
  needsImageUpdate?: boolean;
  newAppVersion?: string;
  osImageVersion?: string;
  osReleaseDate?: string;
  kernelVersion?: string;
  linuxDistribution?: string;
  openFlasher: () => void;
  startUpdate: () => void;
};

export type UsePasswordSettingsLogic = () => ChangePasswordDialogLogic & {
  openChangePasswordDialog: () => void;
};

export type UseSettingsLogic = () => {
  boardSettingsLogic: UseBoardSettingsLogic;
  networkModeLogic: UseNetworkModeLogic;
  networkSettingsLogic: UseNetworkSettingsLogic;
  systemSettingsLogic: UseSystemSettingsLogic;
  passwordSettingsLogic: UsePasswordSettingsLogic;
  onOpenExternal: (url: string) => void;
};

export interface SettingsProps {
  settingsLogic: UseSettingsLogic;
}
