import {
  codeInjectionsSubjectNext,
  codeSubjectNext,
  getBrowser,
  getCodeInjectionsSubject,
  getCodeSubjectById,
  getUnsavedFilesSubject,
  openLinkExternal,
  replaceFileNameInvalidCharacters,
  saveAppFile,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import {
  CodeEditorLogic,
  EditorControlsProps,
  EditorPanelLogic,
  mapAssetSources,
  SelectableFileData,
  snackbar,
  TabsBarLogic,
  useI18n,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { SecretsEditorLogic } from '@cloud-editor-mono/ui-components/lib/components-by-app/shared';
import { EditorView } from '@codemirror/view';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  getSelectedCodeObservableValue,
  useCodeChange,
  useCodeInjectionsObservable,
} from '../../../../../../common/hooks/code';
import {
  codeEditorViewInstance,
  useCodeEditorViewInstance,
} from '../../../../../../common/hooks/editor';
import { SKETCH_SECRETS_FILE_ID } from '../../../../../../common/hooks/files';
import { UseCreateSketchFromExisting } from '../../../../../../common/hooks/queries/create.type';
import { getAppLabFileIcon } from '../../../../../../common/utils';
import { makeAppBrickDetailLogic } from '../../../../../hooks/useBrickDetail';
import { EditorPanelLogicParams } from './appLabEditorPanel.type';
import { messages } from './messages';

let hasExecutedForFile: string | undefined;

function getDataFromFile(
  file?: SelectableFileData,
  appPath?: string,
): () => string | undefined {
  const selectedFileValue = getSelectedCodeObservableValue(
    getCodeSubjectById,
    file?.fileId,
  )?.value;

  if (file?.fileExtension === 'md') {
    return () =>
      mapAssetSources(
        selectedFileValue,
        (path) => '/file-content-assets/' + path,
        appPath,
      );
  }
  return () => selectedFileValue;
}

type UseCreateEditorPanelLogic = (params: EditorPanelLogicParams) => {
  editorPanelLogic: EditorPanelLogic;
};

export const useCreateEditorPanelLogic: UseCreateEditorPanelLogic = function (
  params: EditorPanelLogicParams,
) {
  const {
    appId,
    appPath,
    selectedFile,
    selectFile,
    closeFile,
    updateOpenFilesOrder,
    addAppFile,
    deleteAppFile,
    renameAppFile,
    sketchDataIsLoading,
    selectableMainFile,
    unsavedFileIds,
    openFiles: tabs,
    readOnly,
  } = params;

  const [shouldRenderMarkdown, setShouldRenderMarkdown] = useState(true);
  const { formatMessage } = useI18n();
  const filesWithToastShown = useRef<Set<string>>(new Set());

  const isReadonlyFile = (selectedFile?: SelectableFileData): boolean => {
    const readonlyFiles = ['app.yaml', 'sketch/sketch.yaml'];
    if (!selectedFile) return false;

    return readonlyFiles.includes(selectedFile?.fileId);
  };

  // Show notification when a non-editable file is opened (only for sketches, not examples)
  useEffect(() => {
    if (!selectedFile) return;

    const currentFileIsReadonly = isReadonlyFile(selectedFile);
    const fileId = selectedFile.fileId;

    if (hasExecutedForFile && hasExecutedForFile !== fileId) {
      hasExecutedForFile = undefined;
    }

    if (hasExecutedForFile === fileId) {
      return;
    }
    hasExecutedForFile = fileId;

    // Remove files from Set that are no longer in tabs (file was closed)
    const currentTabIds = new Set(tabs.map((t) => t.fileId));
    for (const toastFileId of filesWithToastShown.current) {
      if (!currentTabIds.has(toastFileId)) {
        filesWithToastShown.current.delete(toastFileId);
      }
    }

    if (!currentFileIsReadonly) {
      toast.dismiss();
      return;
    }

    if (
      currentFileIsReadonly &&
      !readOnly &&
      !filesWithToastShown.current.has(fileId)
    ) {
      // Dismiss all existing toasts before showing a new one
      toast.dismiss();

      snackbar({
        message: formatMessage(messages.readOnlyAttempt),
        variant: 'info',
        opts: { duration: 3000 },
      });

      filesWithToastShown.current.add(fileId);
    }
  }, [selectedFile, readOnly, formatMessage, tabs]);

  const useTabsBarLogic = (): ReturnType<TabsBarLogic> => {
    const browser = getBrowser();
    const hasSetHeightOnHover = Boolean(
      browser?.includes('Safari') ||
        browser?.includes('Opera') ||
        browser?.includes('Chrome') ||
        browser?.includes('Edge') ||
        browser?.includes('WebKit'),
    );

    const selectSecretsTab = useCallback(() => {
      selectFile(SKETCH_SECRETS_FILE_ID);
    }, []);

    const validateFileName = useCallback(() => [], []);

    const makeUniqueFileName = useCallback((fileName: string): string => {
      return fileName;
    }, []);

    return {
      tabs,
      selectableMainFile,
      selectedTab: selectedFile,
      selectTab: selectFile,
      selectSecretsTab,
      closeTab: closeFile,
      updateTabOrder: updateOpenFilesOrder,
      unsavedFileIds,
      isReadOnly: true,
      isExampleSketchRoute: false,
      hasSetHeightOnHover,
      validateFileName,
      makeUniqueFileName,
      addFile: addAppFile,
      renameFile: renameAppFile,
      deleteFile: deleteAppFile,
      replaceFileNameInvalidCharacters,
      getFileIcon: getAppLabFileIcon,
      isRenderedMarkdownFile:
        (selectedFile?.fileExtension === 'md' && shouldRenderMarkdown) ||
        selectedFile?.fileExtension === 'brick',
    };
  };

  const tabsBarLogic = useCallback(useTabsBarLogic, [
    tabs,
    selectableMainFile,
    selectedFile,
    selectFile,
    closeFile,
    updateOpenFilesOrder,
    unsavedFileIds,
    addAppFile,
    renameAppFile,
    deleteAppFile,
    shouldRenderMarkdown,
  ]);

  const { mutateAsync: saveSketchFileQuery } = useMutation({
    mutationFn: async (payload?: {
      fileId?: string;
      code?: string;
      hash?: string;
    }) => {
      if (!payload || !payload.fileId || !payload.code) {
        return Promise.reject(new Error('No payload provided'));
      }

      const { fileId: path, code: content } = payload;
      try {
        await saveAppFile(`${appPath}/${path}`, content);
      } catch (error) {
        return Promise.reject(
          new Error(`Failed to save sketch file: ${error}`),
        );
      }
      return null;
    },
  });

  const updateCodeSubjectHash = useCallback(async () => undefined, []);

  const useCreateSketchFromExisting =
    (): ReturnType<UseCreateSketchFromExisting> => ({
      create: async () => undefined,
      isLoading: false,
    });

  const createSketchFromExisting = useCallback(useCreateSketchFromExisting, []);

  const retrieveSketches = useCallback(async () => [], []);

  const { setCode, saveCode } = useCodeChange(
    saveSketchFileQuery,
    selectFile,
    codeInjectionsSubjectNext,
    getCodeSubjectById,
    codeSubjectNext,
    getUnsavedFilesSubject,
    updateCodeSubjectHash,
    createSketchFromExisting,
    retrieveSketches,
    false,
    false,
    readOnly,
    selectedFile,
    selectableMainFile,
    undefined,
    undefined,
    tabs,
    true,
  );

  useCodeEditorViewInstance(selectFile, tabs);

  const onReceiveViewInstance = useCallback(
    (viewInstance: EditorView | null): void => {
      codeEditorViewInstance.instance = viewInstance;
    },
    [],
  );

  const useCodeEditorLogic = (): ReturnType<CodeEditorLogic> => {
    useCodeInjectionsObservable(getCodeInjectionsSubject);

    return {
      setCode,
      sketchDataIsLoading,
      getCode: () =>
        getSelectedCodeObservableValue(getCodeSubjectById, selectedFile?.fileId)
          ?.value,
      getCodeExt: () =>
        getSelectedCodeObservableValue(getCodeSubjectById, selectedFile?.fileId)
          ?.meta.ext,
      getCodeInstanceId: () =>
        getSelectedCodeObservableValue(getCodeSubjectById, selectedFile?.fileId)
          ?.meta.instanceId,
      getCodeLastInjectionLine: (): number | undefined => {
        const value = getSelectedCodeObservableValue(
          getCodeSubjectById,
          selectedFile?.fileId,
        );
        const lineToScroll = value?.meta.lineToScroll;
        if (value) {
          codeInjectionsSubjectNext(
            value.fileId,
            value.value,
            { saveCode },
            false,
            undefined,
          );
        }
        return lineToScroll;
      },
      getFileId: () => selectedFile?.fileId,
      codeInstanceIds: tabs
        .map(
          (t) =>
            getSelectedCodeObservableValue(getCodeSubjectById, t.fileId)?.meta
              .instanceId,
        )
        .filter((id): id is string => Boolean(id)),
      onReceiveViewInstance,
      fontSize: 12,
      readOnly: readOnly || isReadonlyFile(selectedFile),
      showReadOnlyBanner: readOnly,
      hasHeader: false,
      hasTabs: true,
      useScrollPastEnd: true,
      gutter: readOnly ? undefined : { lineNumberStartOffset: 0 },
    };
  };

  const codeEditorLogic = useCallback(useCodeEditorLogic, [
    onReceiveViewInstance,
    readOnly,
    saveCode,
    selectedFile,
    setCode,
    sketchDataIsLoading,
    tabs,
  ]);

  const useSecretsEditorLogic = (): ReturnType<SecretsEditorLogic> => {
    const updateSecrets = useCallback(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      async (): Promise<void> => {},
      [],
    );

    const openDeleteSecretDialog = useCallback(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      (): void => {},
      [],
    );

    return {
      secrets: undefined,
      updateSecrets,
      openDeleteSecretDialog,
    };
  };

  const secretsEditorLogic = useCallback(useSecretsEditorLogic, []);

  const openExternalLink = useCallback((url: string) => {
    if (!url) {
      console.warn('No URL provided to open externally');
      return;
    }
    openLinkExternal(url);
  }, []);

  const brickDetailLogic = useMemo(
    () => makeAppBrickDetailLogic(appId),
    [appId],
  );

  const useEditorPanelLogic = (): ReturnType<EditorPanelLogic> => {
    const controlsProps = {
      hideControls: true,
    } as EditorControlsProps;

    return {
      tabsBarLogic,
      codeEditorLogic,
      secretsEditorLogic,
      brickDetailLogic,
      selectedFile: selectedFile
        ? {
            id: selectedFile.fileId,
            ext: selectedFile.fileExtension,
            getData: getDataFromFile(selectedFile, appPath),
          }
        : undefined,
      ...controlsProps,
      isFullscreen: false,
      codeIsFormatting: false,
      isConcurrent: false,
      hideTabs: false,
      shouldRenderMarkdown,
      markdownCanBeRendered: true,
      setShouldRenderMarkdown,
      openExternalLink,
      canSwitchMarkdownMode: !(
        selectedFile?.fileId && unsavedFileIds?.has(selectedFile?.fileId)
      ),
      readOnly,
    };
  };

  const editorPanelLogic = useCallback(useEditorPanelLogic, [
    tabsBarLogic,
    codeEditorLogic,
    secretsEditorLogic,
    brickDetailLogic,
    selectedFile,
    appPath,
    shouldRenderMarkdown,
    openExternalLink,
    unsavedFileIds,
    readOnly,
  ]);

  return {
    editorPanelLogic,
  };
};
