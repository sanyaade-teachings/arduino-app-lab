import { UseArduinoAccountLogic } from '../app-lab-account';
import { BoardItem } from '../app-lab-board-section';
import {
  UseBoardConfigurationLogic,
  UseLinuxCredentialsLogic,
  UseNetworkLogic,
} from '../app-lab-settings';

export type ConnectionType = 'USB' | 'Network' | 'Local';

export type Board = {
  id: string;
  isSelecting?: boolean;
  checkingStatus?: boolean;
  name: string;
  type: string;
  connectionType: ConnectionType;
  protocol: string;
  serial: string;
  address: string;
};

export type UseSetupLogic = () => {
  isBoard?: boolean;
  boards: Board[];
  selectedBoard: Board | undefined;
  selectBoard: (board: Board) => void;
  autoSelectBoard: (boardId: string) => void;
  isAutoSelectingBoard: boolean;
  showLoader: boolean;
  showBoardSelectionPage: boolean;
  showPostSelectionSetup: boolean;
  currentStep?: AppLabSetupItemId;
  stepIsSkippable?: boolean;
  contentLogicMap?: SetupContentLogicMap;
  showBoardConnPswPrompt: boolean;
  onConnPswCancel: () => void;
  onConnPswSubmit: (password: string) => Promise<void>;
  isBoardConnectingOrChecking: boolean;
  connToBoardError?: string;
  showConfirmButton?: boolean;
  boardItem?: BoardItem;
  onOpenTerminal: () => Promise<void>;
  terminalError: string | null;
  onBackStep?: () => void;
  unlockAutoFlow?: () => void;
};

export enum AppLabSetupItemId {
  BoardConfiguration,
  NetworkSetup,
  LinuxCredentials,
  ArduinoAccount,
}

export interface SetupContentLogicMap {
  [AppLabSetupItemId.BoardConfiguration]: UseBoardConfigurationLogic;
  [AppLabSetupItemId.NetworkSetup]: UseNetworkLogic;
  [AppLabSetupItemId.LinuxCredentials]: UseLinuxCredentialsLogic;
  [AppLabSetupItemId.ArduinoAccount]: UseArduinoAccountLogic;
}

export type AppLabSetupItem = {
  id: AppLabSetupItemId;
  enabled: boolean;
};

export type SetupSections = {
  [Property in AppLabSetupItemId]: (
    logic: SetupContentLogicMap[Property],
    ref: React.RefObject<{
      confirm: () => void;
      skip?: () => void;
    }>,
  ) => [boolean, React.ReactNode];
};

export interface SetupSection<T extends AppLabSetupItem> {
  item: T;
  logic: SetupContentLogicMap[T['id']];
  render: SetupSections[T['id']];
}
