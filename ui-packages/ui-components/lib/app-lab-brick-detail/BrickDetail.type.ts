import {
  AIModel,
  AIModelItem,
  BrickCreateUpdateRequest,
  BrickDetails,
  BrickInstance,
} from '@cloud-editor-mono/infrastructure';

import {
  UseArduinoAccountLogic,
  UseEdgeImpulseAccountLogic,
} from '../app-lab-account';
import { BoardResourcesValue } from '../app-lab-footer-bar';

export type BrickDetailLogic = () => {
  initialTab?: string;
  showConfigure?: boolean;
  edgeImpulseProps?: {
    projects: AIModel[];
    projectsLoading: boolean;
    getEIProjectsByBrickType: (brickType: string) => AIModel[];
    downloadImpulse: (
      modelId: string,
      impulseId: string,
    ) => Promise<AIModelItem>;
    isEIModelInstalled: (modelId: string, impulseId: string) => boolean;
    getInstalledModel: (
      projectId: string,
      impulseId?: string,
    ) => AIModelItem | undefined;
    getEIModelDownloadInfo: (
      projectId: string,
    ) => AIModelDownloadInfo | undefined;
    removeEIModel: (modelId: string, impulseId?: string) => Promise<void>;
    enabledEIAutoRefresh: (enabled: boolean) => void;
    openAndAssociateToDevice: () => void;
  };
  loadBrickInstance?: (id: string) => Promise<BrickInstance>;
  loadBrickDetails: (id: string) => Promise<BrickDetails>;
  loadFileContent: (path: string) => Promise<string>;
  onOpenExternalLink?: (url: string) => void;
  updateBrickDetails?: (
    id: string,
    params: BrickCreateUpdateRequest,
  ) => Promise<boolean>;
  arduinoAuthAccountLogic: UseArduinoAccountLogic;
  edgeImpulseAuthAccountLogic: UseEdgeImpulseAccountLogic;
  showTrainNewModel?: boolean;
  boardResourcesLogic: () => BoardResourcesValue;
};

export type AIModelDownloadInfo = {
  impulseId: string;
  isDownloading: boolean;
  error?: boolean;
  success?: boolean;
};
