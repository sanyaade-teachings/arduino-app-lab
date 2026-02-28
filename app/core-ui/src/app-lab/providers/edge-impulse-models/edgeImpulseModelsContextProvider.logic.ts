import { Config } from '@cloud-editor-mono/common';
import {
  deleteAIModel,
  getAIModels,
  getEIProjects,
  installEIModel,
  openLinkExternal,
  setEILatencyDevice,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import { AIModelItem, EIProject } from '@cloud-editor-mono/infrastructure';
import { AIModelDownloadInfo } from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, set } from 'idb-keyval';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { sendAppLabNotification } from '../../features/notifications';
import { useBoardLifecycleStore } from '../../store/boards/boards';
import { EdgeImpulseContext } from '../edge-impulse/edgeImpulseContext';
import { EdgeImpulseModelsContextValue } from './edgeImpulseModelsContext';
import { isCompatibleEICategory, mapProjectToModel } from './utils';

export type UseEdgeImpulseParams = {
  enabled?: boolean;
};
const CHECK_STORAGE_KEY = 'ei_project_association_check_performed';

export function useEdgeImpulseModelsLogic(
  _params: UseEdgeImpulseParams = {},
): EdgeImpulseModelsContextValue {
  const [enableEdgeImpulseAutoRefresh, setEnableEdgeImpulseAutoRefresh] =
    useState(false);

  const [currentDownloads, setCurrentDownloads] = useState<{
    [projectId: string]: AIModelDownloadInfo;
  } | null>(null);

  const queryClient = useQueryClient();
  const { boardIsReachable } = useBoardLifecycleStore();

  const { isAuthenticated } = useContext(EdgeImpulseContext);

  const [unoQProjects, setUnoQProjects] = useState<EIProject[]>([]);
  const { data: eiProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['edge-impulse-projects', isAuthenticated],
    queryFn: getEIProjects,
    enabled: enableEdgeImpulseAutoRefresh && isAuthenticated,
    refetchOnWindowFocus: true,
  });
  useEffect(() => {
    setUnoQProjects(eiProjects?.filter((p) => p.hasUnoQLatencyDevice) || []);
  }, [eiProjects]);

  const eiModels = useMemo(
    () => unoQProjects.map(mapProjectToModel),
    [unoQProjects],
  );

  const installedModelsQueryKey = ['installed-models'];
  const { data: installedModels } = useQuery({
    queryKey: installedModelsQueryKey,
    queryFn: getAIModels,
    enabled: enableEdgeImpulseAutoRefresh && boardIsReachable,
  });

  const installedModelsLookup = useMemo(
    () =>
      installedModels?.reduce((lookup, model) => {
        return model.id
          ? {
              ...lookup,
              [model.id]: model,
            }
          : lookup;
      }, {} as { [key: string]: AIModelItem }),
    [installedModels],
  );

  const isEIModelInstalled = useCallback(
    (projectId: string, impulseId: string) => {
      const id = `ei-model-${projectId}-${impulseId}`;
      return !!installedModelsLookup?.[id];
    },
    [installedModelsLookup],
  );

  const getInstalledModel = useCallback(
    (modelId: string, impulseId?: string) => {
      const id = impulseId ? `ei-model-${modelId}-${impulseId}` : modelId;
      return installedModelsLookup?.[id];
    },
    [installedModelsLookup],
  );

  const getEIModelDownloadInfo = useCallback(
    (projectId: string) => {
      const downloadItem = currentDownloads?.[projectId];
      return downloadItem;
    },
    [currentDownloads],
  );

  const getEIProjectsByBrickType = useCallback(
    (brickType: string) => {
      return unoQProjects
        .filter((p) =>
          isCompatibleEICategory(brickType, p.category, p.impulses),
        )
        .map(mapProjectToModel);
    },
    [unoQProjects],
  );

  const downloadImpulse = async (
    projectId: string,
    impulseId: string,
  ): Promise<AIModelItem> => {
    if (currentDownloads?.[projectId]?.isDownloading) {
      throw Error('Already downloading a model from this project');
    }

    const updateDownload = (info: Partial<AIModelDownloadInfo>): void =>
      setCurrentDownloads((prev) => ({
        ...(prev || {}),
        [projectId]: {
          ...(prev || {})[projectId],
          ...info,
        },
      }));

    let item: AIModelItem;
    try {
      updateDownload({
        impulseId,
        error: false,
        success: false,
        isDownloading: true,
      });
      // TODO: pass signal here if we want to
      item = await installEIModel(projectId, impulseId);
      queryClient.setQueryData(
        installedModelsQueryKey,
        (prev: AIModelItem[] | undefined) => {
          return [...(prev || []), item];
        },
      );
      updateDownload({ isDownloading: false, success: true });
    } catch (error: unknown) {
      if (error instanceof Error) {
        sendAppLabNotification({
          message: error.message,
          variant: 'error',
        });
      } else {
        console.error(error);
      }
      updateDownload({ isDownloading: false, error: true });

      return Promise.reject(error);
    }

    return item;
  };

  const removeEIModel = async (
    projectId: string,
    impulseId?: string,
  ): Promise<void> => {
    const id = impulseId ? `ei-model-${projectId}-${impulseId}` : projectId;
    try {
      await deleteAIModel(id);
      queryClient.setQueryData(
        installedModelsQueryKey,
        (prev: AIModelItem[] | undefined) => {
          return prev?.filter((model) => model.id !== id);
        },
      );
    } catch (error) {
      if (error instanceof Error) {
        sendAppLabNotification({
          message: error.message,
          variant: 'error',
        });
      } else {
        console.error(error);
      }
    }
  };

  const { mutate: openAndAssociateToDevice } = useMutation({
    mutationFn: async () => {
      const alreadyChecked = await get(CHECK_STORAGE_KEY);

      const url = `${Config.EI_STUDIO_HOST}?defaultIdps=arduino`; // `defaultIdps=arduino` shows "login with Arduino"

      const freshEiProjects = eiProjects || (await getEIProjects()); // fetch in case above query not yet loaded

      if (freshEiProjects?.length !== 1 || alreadyChecked) {
        openLinkExternal(url);
        return;
      }

      const project = freshEiProjects[0];

      const createdDate = project.created
        ? new Date(project.created)
        : new Date(0);
      const twoHoursAgo = new Date();
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

      if (
        createdDate < twoHoursAgo ||
        project.hasUnoQLatencyDevice ||
        project.hasOtherNonDefaultLatencyDevice ||
        !project.id
      ) {
        openLinkExternal(url);
        return;
      }

      await setEILatencyDevice(project.id.toString());
      openLinkExternal(url);
    },

    onSuccess: async () => {
      await set(CHECK_STORAGE_KEY, true);
    },
  });

  return {
    projects: eiModels,
    projectsLoading,
    getEIProjectsByBrickType,
    downloadImpulse,
    isEIModelInstalled,
    getInstalledModel,
    getEIModelDownloadInfo,
    removeEIModel,
    enabledEIAutoRefresh: setEnableEdgeImpulseAutoRefresh,
    openAndAssociateToDevice,
  };
}
