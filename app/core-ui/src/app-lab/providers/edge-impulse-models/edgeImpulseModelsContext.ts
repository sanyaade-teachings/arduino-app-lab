import { AIModel, AIModelItem } from '@cloud-editor-mono/infrastructure';
import { AIModelDownloadInfo } from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { createContext, useContext } from 'react';

export type EdgeImpulseModelsContextValue = {
  projects: AIModel[];
  projectsLoading: boolean;
  getEIProjectsByBrickType: (brickType: string) => AIModel[];
  downloadImpulse: (modelId: string, impulseId: string) => Promise<AIModelItem>;
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

const EdgeImpulseModelsContextValue: EdgeImpulseModelsContextValue =
  {} as EdgeImpulseModelsContextValue;

export const EdgeImpulseModelsContext =
  createContext<EdgeImpulseModelsContextValue>(EdgeImpulseModelsContextValue);

export const useEdgeImpulseModels = (): EdgeImpulseModelsContextValue => {
  const context = useContext(EdgeImpulseModelsContext);

  if (!context) {
    throw new Error(
      'useEdgeImpulseModelsContext must be used within an EdgeImpulseModelsContextProvider',
    );
  }

  return context;
};
