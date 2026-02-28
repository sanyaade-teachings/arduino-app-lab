import { AIModel, AIModelItem } from '@cloud-editor-mono/infrastructure';

import { BoardResourcesValue } from '../../../app-lab-footer-bar';
import { AIModelDownloadInfo } from '../../BrickDetail.type';

export interface AppLabAiModelProps {
  inUseModelId?: string;
  model: AIModel;
  selectedModelId?: string;
  boardResourcesLogic: () => BoardResourcesValue;
  onClick?: (modelId: string) => void;
  downloadModel?: (modelId: string, impulseId: string) => Promise<void>;
  modelDownloadInfo?: AIModelDownloadInfo;
  removeModel?: (modelId: string, impulseId: string) => Promise<void>;
  getInstalledModel?: (
    modelId: string,
    impulseId?: string,
  ) => AIModelItem | undefined;
  openEdgeImpulse?: (modelId: string, impulseId?: string) => void;
}
