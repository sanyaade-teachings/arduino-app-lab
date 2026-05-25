import {
  getAppBricks,
  getAppDetail,
  getAppFiles,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import {
  AppDetailedInfo,
  BrickInstance,
} from '@cloud-editor-mono/infrastructure';
import {
  FileNode,
  TreeNode,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  FileWithContent,
  useRetrieveBatchArduinoAppFileContents,
} from '../../../../../../common/hooks/queries/arduinoAppFiles';

export const MAIN_SKETCH_PATH = 'sketch/sketch.ino';
export const APP_YAML_PATH = 'app.yaml';
export const SKETCH_YAML_PATH = 'sketch/sketch.yaml';
export const README_PATH = 'README.md';
export const MAIN_PYTHON_PATH = 'python/main.py';

type UseAppDetailFiles = (
  appId: string,
  updateOpenFile?: (currFileId: string, nextFileId: string) => void,
) => {
  appDetail?: AppDetailedInfo;
  appDetailIsLoading: boolean;
  appBricks?: BrickInstance[];
  appBricksAreLoading: boolean;
  defaultFile?: FileNode;
  filesList?: FileNode[];
  filesListIsLoading: boolean;
  filesListIsLoaded: boolean;
  filesContents?: FileWithContent[];
  filesContentsAreLoading: boolean;
  allContentsRetrieved: boolean;
  fileTree?: TreeNode[];
  sketchDataIsLoading: boolean;
  addAppFile: (
    fileId: string,
    fileName: string,
    fileExtension: string,
  ) => Promise<void>;
  renameAppFile: (
    from?: string,
    to?: string,
    nodeType?: 'file' | 'folder',
  ) => Promise<void>;
  moveFileHandler: (
    fromPath: string,
    toPath: string,
    filesToUpdate?: Array<{ oldPath: string; newPath: string }>,
  ) => Promise<void>;
  deleteAppFile: (path?: string, nodeType?: 'file' | 'folder') => Promise<void>;
  refetchAppDetail: () => void;
  refetchAppYaml: () => Promise<unknown>;
  refetchSketchYaml: () => Promise<unknown>;
  refetchAppBricks: () => Promise<unknown>;
  refetchAppFiles: () => Promise<unknown>;
  removeFileFromPending: (path: string) => void;
  createAppFolder: (path: string) => Promise<void>;
};

export const useAppDetailFiles: UseAppDetailFiles = function (
  appId: string,
  updateOpenFile?: (currFileId: string, nextFileId: string) => void,
): ReturnType<UseAppDetailFiles> {
  const {
    data: appDetail,
    isLoading: appDetailIsLoading,
    refetch: refetchAppDetail,
  } = useQuery(['list-my-apps', appId], () => getAppDetail(appId));

  const {
    data: appBricks,
    isLoading: appBricksAreLoading,
    refetch: refetchAppBricks,
  } = useQuery(['app-bricks', appId], () => getAppBricks(appId));

  const {
    data: { filesList, fileTree } = {},
    isLoading: filesListIsLoading,
    isSuccess: filesListIsLoaded,
    refetch: refetchAppFiles,
  } = useQuery(
    ['app-files', appId],
    async () => {
      if (appDetail?.path) {
        return getAppFiles(appDetail?.path);
      }
    },
    {
      enabled: !!appDetail?.path,
    },
  );

  const defaultFile = useMemo(() => {
    const priorityFiles = [
      README_PATH,
      MAIN_PYTHON_PATH,
      MAIN_SKETCH_PATH,
      APP_YAML_PATH,
    ];

    for (const filePath of priorityFiles) {
      const foundNode = filesList?.find((file) => file.path === filePath);
      if (foundNode) {
        return foundNode;
      }
    }
  }, [filesList]);

  const [pendingFileIds, setPendingFileIds] = useState<string[]>([]);
  const [pendingFileIdWasRemoved, setPendingFileIdWasRemoved] = useState(false);

  useEffect(() => {
    if (filesList) {
      setPendingFileIds(filesList.map((f) => f.path));
    }
  }, [filesList]);

  const filesListKey = useMemo(() => ['app-files', appId], [appId]);
  const {
    filesContents,
    isLoading: fileBatchIsLoading,
    allContentsRetrieved,
    deleteAppFile,
    renameAppFile,
    addAppFile,
    createAppFolder,
    moveFileHandler,
    refreshFileContents,
  } = useRetrieveBatchArduinoAppFileContents(
    !!filesList,
    filesListKey,
    filesList,
    appDetail?.path,
    pendingFileIds,
    pendingFileIdWasRemoved,
    updateOpenFile,
  );

  const refetchAppYaml = useCallback(async (): Promise<void> => {
    refreshFileContents([APP_YAML_PATH]);
  }, [refreshFileContents]);

  const refetchSketchYaml = useCallback(async (): Promise<void> => {
    refreshFileContents([SKETCH_YAML_PATH]);
  }, [refreshFileContents]);

  const removeFileFromPending = useCallback((path: string) => {
    setPendingFileIdWasRemoved(true);

    setPendingFileIds((prev) => {
      // if id is not in pending list do nothing
      if (!prev.includes(path)) {
        return prev;
      }

      return prev.filter((id) => id !== path);
    });
  }, []);

  const filesContentsAreLoading = fileBatchIsLoading;

  return {
    appDetail,
    appDetailIsLoading,
    appBricks,
    appBricksAreLoading,
    defaultFile,
    filesList,
    filesListIsLoading,
    filesListIsLoaded,
    filesContents,
    filesContentsAreLoading,
    allContentsRetrieved,
    fileTree,
    sketchDataIsLoading: filesContentsAreLoading || appBricksAreLoading,
    addAppFile,
    renameAppFile,
    deleteAppFile,
    refetchAppDetail,
    moveFileHandler,
    refetchAppYaml,
    refetchSketchYaml,
    refetchAppBricks,
    refetchAppFiles,
    removeFileFromPending,
    createAppFolder,
  };
};
