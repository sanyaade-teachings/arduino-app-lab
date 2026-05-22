import { BrickIcon } from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { SelectableFileData } from '@cloud-editor-mono/ui-components/lib/components-by-app/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as IDB from 'idb-keyval';
import { sortBy } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEvent } from 'react-use';

import { getAppLabFileIcon, getFileIcon, getMainLibraryFile } from '../utils';
import { UseFiles } from './files.type';
import { useObservable } from './useObservable';

export const OPEN_FILES_KEY = 'arduino:editor:open-files';
export type OpenFilesStoreItem = { items: string[]; selected: string | null };
export type OpenFilesStore = { [key: string]: OpenFilesStoreItem };

export const SKETCH_SECRETS_FILE_ID = 'sketch.secrets';

export const useFiles: UseFiles = function ({
  mainFile,
  bricks,
  files,
  defaultFilePath,
  filesAreLoading = true,
  filesContentLoaded = false,
  isLibraryRoute = false,
  showSketchSecretsFile = false,
  storeEntityId = undefined,
  getUnsavedFilesSubject,
  autoOpenedFiles,
  isClassicSketch = true,
}): ReturnType<UseFiles> {
  const [selectedFileId, setSelectedFileId] = useState<string | undefined>(
    undefined,
  );
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);
  const [enableOpenFilesPersistence] = useState(true);

  const queryClient = useQueryClient();
  const { data: openFilesStore } = useQuery(
    ['get-stored-open-files', storeEntityId],
    async () => {
      if (!storeEntityId) {
        return null;
      }
      const store = await IDB.get<OpenFilesStore>(OPEN_FILES_KEY);
      return store?.[storeEntityId] || null;
    },
    {
      enabled: enableOpenFilesPersistence,
    },
  );

  const unsavedFileIds = useObservable(getUnsavedFilesSubject());

  useEvent('beforeunload', (e: Event) => {
    if ((unsavedFileIds ?? new Set()).size !== 0) {
      e.preventDefault();
    }
  });

  const selectableMainFile: SelectableFileData | undefined = useMemo(() => {
    if (!mainFile) return undefined;
    const IconComponent = isClassicSketch
      ? getFileIcon(mainFile.extension)
      : getAppLabFileIcon(
          mainFile.name === 'app.yaml' ? 'config' : mainFile.extension,
        );
    return {
      fileId: mainFile.path,
      fileFullName: mainFile.fullName,
      fileName: mainFile.name,
      fileExtension: mainFile.extension,
      Icon: IconComponent ? <IconComponent /> : undefined,
      tags: ['Main'],
      isFixed: isClassicSketch,
      isMetadataReadOnly: isClassicSketch,
    };
  }, [isClassicSketch, mainFile]);

  const mainLibraryFile = useMemo(() => {
    if (isLibraryRoute && !filesAreLoading && files) {
      const mainLibFile = getMainLibraryFile(files);
      if (mainLibFile) {
        const IconComponent = getFileIcon(mainLibFile.extension);
        return {
          fileId: mainLibFile.path,
          fileFullName: mainLibFile.fullName,
          fileName: mainLibFile.name,
          fileExtension: mainLibFile.extension,
          Icon: IconComponent ? <IconComponent /> : undefined,
          tags: ['Main'],
          isFixed: isClassicSketch,
          isMetadataReadOnly: isClassicSketch,
        };
      }
    }
  }, [isLibraryRoute, filesAreLoading, files, isClassicSketch]);

  const bricksFiles = useMemo(
    () =>
      (bricks ?? []).map((brick) => ({
        fileId: brick.id,
        fileName: brick.name,
        fileFullName: brick.name,
        fileExtension: 'brick',
        Icon: <BrickIcon category={brick.category} size="xsmall" />,
        isMetadataReadOnly: true,
      })),
    [bricks],
  );

  const sketchSecretsFile = useMemo(() => {
    // NOTE: this is not real sketch file but it's used to manage the secrets file in the UI
    // Set it after `filesContentLoaded` to prevent instant load of the file for better UX
    if (
      filesContentLoaded &&
      (showSketchSecretsFile ||
        openFileIds.includes(SKETCH_SECRETS_FILE_ID) ||
        openFilesStore?.items?.includes(SKETCH_SECRETS_FILE_ID))
    ) {
      return {
        fileId: SKETCH_SECRETS_FILE_ID,
        fileName: 'Sketch Secrets',
        fileFullName: 'Sketch Secrets',
        fileExtension: 'secrets',
        Icon: getFileIcon('secrets'),
        tags: [],
        isMetadataReadOnly: true,
      };
    }
  }, [
    filesContentLoaded,
    openFileIds,
    openFilesStore?.items,
    showSketchSecretsFile,
  ]);

  const otherFiles = useMemo(() => {
    if (files === undefined) {
      return [];
    }
    return files
      .map((file) => {
        const IconComponent = isClassicSketch
          ? getFileIcon(file.extension)
          : getAppLabFileIcon(file.extension);
        return {
          fileId: file.path,
          fileFullName: file.fullName,
          fileName: file.name,
          fileExtension: file.extension,
          Icon: IconComponent ? <IconComponent /> : undefined,
          isFixed: false,
          isMetadataReadOnly: false,
        };
      })
      .filter((f) =>
        isLibraryRoute ? f.fileId !== mainLibraryFile?.fileId : true,
      );
  }, [files, isClassicSketch, isLibraryRoute, mainLibraryFile?.fileId]);

  const editorFiles = useMemo(
    () =>
      [
        isLibraryRoute ? mainLibraryFile : selectableMainFile,
        ...sortBy(otherFiles, (f) => f.fileName.toLowerCase()),
        sketchSecretsFile,
        ...bricksFiles,
      ].filter((f): f is SelectableFileData => Boolean(f)),
    [
      bricksFiles,
      isLibraryRoute,
      selectableMainFile,
      mainLibraryFile,
      otherFiles,
      sketchSecretsFile,
    ],
  );

  // Generate ids and names indexed maps for editor files and open files
  // This can improve lookups, especially for large file lists
  const { editorFileIdsMap, editorFileNamesMap } = useMemo(() => {
    return editorFiles.reduce<{
      editorFileIdsMap: Record<string, SelectableFileData>;
      editorFileNamesMap: Record<string, SelectableFileData>;
    }>(
      (acc, data) => {
        return {
          editorFileIdsMap: { ...acc.editorFileIdsMap, [data.fileId]: data },
          editorFileNamesMap: {
            ...acc.editorFileNamesMap,
            [data.fileFullName]: data,
          },
        };
      },
      { editorFileIdsMap: {}, editorFileNamesMap: {} },
    );
  }, [editorFiles]);

  const { openFiles, selectedFile } = useMemo(
    () =>
      openFileIds.reduce<{
        openFiles: SelectableFileData[];
        selectedFile?: SelectableFileData | undefined;
      }>(
        (acc, id) => {
          const openFile = editorFileIdsMap[id];
          if (!openFile) {
            return acc;
          }
          return {
            openFiles: [...acc.openFiles, openFile],
            selectedFile: selectedFileId === id ? openFile : acc.selectedFile,
          };
        },
        { openFiles: [], selectedFile: undefined },
      ),
    [editorFileIdsMap, openFileIds, selectedFileId],
  );

  const openFilesInitComplete = useRef(false);

  useEffect(() => {
    const storedOpenFileNamesIsLoading = openFilesStore === undefined;
    if (storedOpenFileNamesIsLoading || openFilesInitComplete.current) {
      return;
    }

    if (filesContentLoaded) {
      // When first load is complete, lock the open files state
      // NOTE: `filesContentLoaded` is set atomically with `files` final value,
      // so we need to lock the open files state after the `firstLoadCompete` truthy value
      openFilesInitComplete.current = true;
    }

    const initOpenFiles = (): void => {
      let currOpenFilesIds: string[] = [];

      if (openFilesStore && openFilesStore.items.length > 0) {
        currOpenFilesIds = openFilesStore.items.reduce((acc, fileId) => {
          const file = editorFileIdsMap[fileId];
          return file ? [...acc, file.fileId] : acc;
        }, [] as string[]);
      } else {
        if (isClassicSketch) {
          // Open all files in classic sketch
          currOpenFilesIds = editorFiles.map((f) => f.fileId);
        } else {
          // If no stored open files, open default ones
          currOpenFilesIds = [defaultFilePath || 'app.yaml'];
        }
      }

      if (isClassicSketch) {
        // Always ensure main file is included in open files only in classic sketch
        // If the sketch is renamed outside of current session, the stored ino file name can be outdated
        const mainFileId =
          selectableMainFile?.fileId || mainLibraryFile?.fileId;
        if (
          isClassicSketch &&
          mainFileId &&
          editorFileIdsMap[mainFileId] &&
          !currOpenFilesIds.includes(mainFileId)
        ) {
          currOpenFilesIds = [mainFileId, ...currOpenFilesIds];
        }
      }

      setOpenFileIds(currOpenFilesIds);

      if (!isClassicSketch) {
        const lastSelectedFileId = openFilesStore?.selected;
        let currSelectedFileId: string | null = null;
        if (
          lastSelectedFileId &&
          currOpenFilesIds.includes(lastSelectedFileId)
        ) {
          currSelectedFileId = lastSelectedFileId;
        }

        if (openFilesInitComplete.current && !currSelectedFileId) {
          currSelectedFileId = currOpenFilesIds[0];
        }

        setSelectedFileId(currSelectedFileId ?? undefined);
      }

      const mainFileId = selectableMainFile?.fileId || mainLibraryFile?.fileId;
      if (
        isClassicSketch &&
        !selectedFileId &&
        mainFileId &&
        mainFileId !== selectedFileId &&
        currOpenFilesIds.includes(mainFileId)
      ) {
        setSelectedFileId(mainFileId);
      }
    };

    initOpenFiles();
  }, [
    bricks,
    editorFileIdsMap,
    editorFileNamesMap,
    editorFiles,
    filesContentLoaded,
    selectableMainFile,
    mainLibraryFile?.fileId,
    selectedFileId,
    sketchSecretsFile,
    isClassicSketch,
    autoOpenedFiles,
    openFilesStore,
    defaultFilePath,
  ]);

  useEffect(() => {
    // Clear selected file if new sketch/lib is loading
    if (openFilesInitComplete.current && !filesContentLoaded) {
      openFilesInitComplete.current = false;
      setSelectedFileId(undefined);
      setOpenFileIds([]);
    }
  }, [filesContentLoaded]);

  const storeOpenFiles = useCallback(
    async (fileIds: string[], selectedFileId: string | undefined) => {
      if (!storeEntityId || !enableOpenFilesPersistence) {
        return;
      }

      const uniqueFileIds = Array.from(new Set(fileIds));
      await IDB.update(OPEN_FILES_KEY, (prevValue?: OpenFilesStore) => {
        const prevStoreItem = prevValue?.[storeEntityId];
        return {
          ...prevValue,
          [storeEntityId]: {
            items: uniqueFileIds,
            selected: selectedFileId ?? prevStoreItem?.selected ?? null,
          },
        };
      });
      queryClient.invalidateQueries(['get-stored-open-files', storeEntityId]);
    },
    [storeEntityId, enableOpenFilesPersistence, queryClient],
  );

  useEffect(() => {
    if (!openFilesInitComplete.current) {
      return;
    }
    // Store open files when openFileIds or files changes
    storeOpenFiles(openFileIds, selectedFileId);
  }, [openFilesInitComplete, openFileIds, selectedFileId, storeOpenFiles]);

  const selectFile = useCallback(
    (fileId?: string, openAtIndex?: number) => {
      if (!filesContentLoaded) {
        return;
      }

      setSelectedFileId((prevSelectedFileId) => {
        if (prevSelectedFileId === fileId) {
          return prevSelectedFileId;
        }

        if (!fileId) {
          return undefined;
        }

        setOpenFileIds((prevOpenFileIds) => {
          if (fileId && prevOpenFileIds.includes(fileId)) {
            return prevOpenFileIds;
          }
          let currOpenFileIds: string[];
          if (
            typeof openAtIndex === 'number' &&
            Number.isInteger(openAtIndex) &&
            openAtIndex >= 0 &&
            openAtIndex < prevOpenFileIds.length
          ) {
            currOpenFileIds = [
              ...prevOpenFileIds.slice(0, openAtIndex),
              fileId,
              ...prevOpenFileIds.slice(openAtIndex),
            ];
          } else {
            currOpenFileIds = [...prevOpenFileIds, fileId];
          }
          return currOpenFileIds;
        });

        return fileId;
      });
    },
    [filesContentLoaded],
  );

  const closeFile = useCallback(
    (fileId: string) => {
      if (!filesContentLoaded) {
        return;
      }

      setOpenFileIds((prevOpenFileIds) => {
        if (
          !prevOpenFileIds.includes(fileId) ||
          fileId ===
            ((isClassicSketch && selectableMainFile?.fileId) ||
              mainLibraryFile?.fileId)
        ) {
          return prevOpenFileIds;
        }

        setSelectedFileId((prevSelectedFileId) => {
          if (fileId === prevSelectedFileId) {
            // Always select tab to the left if not closing the leftmost tab
            // NOTE: main .ino file cannot be closed so there is always a tab remaining
            const closedFileIndex = prevOpenFileIds.indexOf(fileId);
            return closedFileIndex === 0
              ? prevOpenFileIds[1]
              : prevOpenFileIds[closedFileIndex - 1];
          }
          return prevSelectedFileId;
        });
        const currOpenFileIds = prevOpenFileIds.filter((id) => id !== fileId);
        return currOpenFileIds;
      });
    },
    [
      filesContentLoaded,
      isClassicSketch,
      selectableMainFile?.fileId,
      mainLibraryFile?.fileId,
    ],
  );

  const updateOpenFile = useCallback(
    (currFileId: string, nextFileId: string) => {
      setSelectedFileId((prevSelectedFileId) => {
        if (currFileId === prevSelectedFileId) {
          return nextFileId;
        }
        return prevSelectedFileId;
      });
      setOpenFileIds((prevOpenFileIds) => {
        let currOpenFileIds = prevOpenFileIds;
        currOpenFileIds = prevOpenFileIds.map((id) =>
          currFileId === id ? nextFileId : id,
        );
        return currOpenFileIds;
      });
    },
    [],
  );

  const updateOpenFilesOrder = useCallback(
    (fileIds: string[]) => {
      setOpenFileIds((prevOpenFileIds) => {
        if (
          fileIds.length !== prevOpenFileIds.length ||
          !fileIds.every(
            (id) => prevOpenFileIds.includes(id) && editorFileIdsMap[id],
          )
        ) {
          return prevOpenFileIds;
        }
        return fileIds;
      });
    },
    [editorFileIdsMap],
  );

  const onSketchRename = useCallback(
    async (_newName: string) => {
      if (!storeEntityId || !selectableMainFile || !openFilesStore) {
        return;
      }

      // CHECK ME: this might restore open files when renaming classic sketch
      await IDB.update(OPEN_FILES_KEY, (prevValue?: OpenFilesStore) => {
        const storeItem = prevValue?.[storeEntityId] || {
          items: [selectableMainFile.fileId],
          selected: selectableMainFile.fileId,
        };
        return { ...prevValue, [storeEntityId]: storeItem };
      });
      queryClient.invalidateQueries(['get-stored-open-files', storeEntityId]);
    },
    [storeEntityId, selectableMainFile, openFilesStore, queryClient],
  );

  const onAppRename = useCallback(
    async (newAppId: string) => {
      if (!storeEntityId || !openFilesStore) {
        return;
      }

      const prevAppId = storeEntityId.split('-')[0];
      if (!prevAppId || prevAppId === newAppId) return;

      const newStoreEntityId = storeEntityId.replace(prevAppId, newAppId);

      await IDB.update(OPEN_FILES_KEY, (prevValue?: OpenFilesStore) => {
        if (!prevValue) return {};

        const storeItem = prevValue?.[storeEntityId];
        delete prevValue?.[storeEntityId];
        return { ...prevValue, [newStoreEntityId]: storeItem };
      });
      queryClient.invalidateQueries(['get-stored-open-files', storeEntityId]);
    },
    [openFilesStore, queryClient, storeEntityId],
  );

  return {
    mainFile: selectableMainFile,
    editorFiles,
    openFiles,
    unsavedFileIds,
    selectedFile,
    openFilesStore,
    selectFile,
    closeFile,
    updateOpenFile,
    updateOpenFilesOrder,
    onSketchRename,
    onAppRename,
  };
};
