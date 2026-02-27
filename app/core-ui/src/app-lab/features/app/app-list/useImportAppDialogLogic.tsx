import {
  importApp,
  importAppFromFile,
  importAppFromPath,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import { snackbar } from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { ImportAppDialogLogic, ImportStatus } from './importAppDialog.type';

const createSuccessfulImportMessage = (appName: string): string =>
  `${appName} Correctly imported`;

export const useImportAppDialogLogic = (
  importAppDialogOpen: boolean,
  setImportAppDialogOpen: (open: boolean) => void,
  importStatus: ImportStatus,
  setImportStatus: (status: ImportStatus) => void,
  importErrorMessage: string | undefined,
  setImportErrorMessage: (message: string | undefined) => void,
  setImportedAppId: (id: string | undefined) => void,
): ImportAppDialogLogic => {
  const queryClient = useQueryClient();

  const closeDialog = useCallback(() => {
    setImportStatus(ImportStatus.Idle);
    setImportErrorMessage(undefined);
    setImportAppDialogOpen(false);
  }, [setImportAppDialogOpen, setImportStatus, setImportErrorMessage]);

  const { mutateAsync: handleImport } = useMutation({
    mutationFn: async () => {
      setImportStatus(ImportStatus.Uploading);
      setImportErrorMessage(undefined);
      return importApp();
    },
    onSuccess: (result) => {
      if (!result) {
        // User cancelled the file dialog - reset to Idle
        setImportStatus(ImportStatus.Idle);
        return;
      }

      setImportedAppId(result.id);
      queryClient.invalidateQueries(['list-my-apps']);

      snackbar({
        message: createSuccessfulImportMessage(result.name),
        variant: 'success',
      });

      closeDialog();
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'string'
          ? error
          : error && typeof error === 'object' && 'message' in error
          ? (error as Error).message
          : 'Unknown error occurred';

      setImportStatus(ImportStatus.UploadFailed);
      setImportErrorMessage(message);
    },
  });

  const { mutateAsync: handleImportFromPath } = useMutation({
    mutationFn: async (filePath: string) => {
      setImportStatus(ImportStatus.Uploading);
      setImportErrorMessage(undefined);
      return importAppFromPath(filePath);
    },
    onSuccess: (result) => {
      setImportedAppId(result.id);
      queryClient.invalidateQueries(['list-my-apps']);

      snackbar({
        message: createSuccessfulImportMessage(result.name),
        variant: 'success',
      });

      closeDialog();
    },
    onError: (error: unknown) => {
      setImportStatus(ImportStatus.UploadFailed);

      const message =
        typeof error === 'string'
          ? error
          : error && typeof error === 'object' && 'message' in error
          ? (error as Error).message
          : 'Unknown error occurred';

      setImportErrorMessage(message);
    },
  });

  const startImport = useCallback(async () => {
    await handleImport();
  }, [handleImport]);

  const handleFileDrop = useCallback(
    async (file: File) => {
      const filePath = (file as File & { path?: string }).path;

      if (filePath) {
        await handleImportFromPath(filePath);
        return;
      }

      try {
        setImportStatus(ImportStatus.Uploading);
        setImportErrorMessage(undefined);

        const result = await importAppFromFile(file);

        setImportedAppId(result.id);
        queryClient.invalidateQueries(['list-my-apps']);

        snackbar({
          message: createSuccessfulImportMessage(result.name),
          variant: 'success',
        });

        closeDialog();
      } catch (error) {
        setImportStatus(ImportStatus.UploadFailed);

        const message =
          typeof error === 'string'
            ? error
            : error && typeof error === 'object' && 'message' in error
            ? (error as Error).message
            : 'Unable to access file';

        setImportErrorMessage(message);
      }
    },
    [
      setImportStatus,
      setImportErrorMessage,
      setImportedAppId,
      queryClient,
      closeDialog,
      handleImportFromPath,
    ],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        // Reset state when opening dialog
        setImportStatus(ImportStatus.Idle);
        setImportErrorMessage(undefined);
        setImportedAppId(undefined);
      }
      if (!open) {
        setImportStatus(ImportStatus.Idle);
        setImportErrorMessage(undefined);
        setImportedAppId(undefined);
      }
      setImportAppDialogOpen(open);
    },
    [
      setImportStatus,
      setImportErrorMessage,
      setImportedAppId,
      setImportAppDialogOpen,
    ],
  );

  return () => ({
    open: importAppDialogOpen,
    status: importStatus,
    errorMessage: importErrorMessage,
    onOpenChange: handleOpenChange,
    startImport,
    handleFileDrop,
  });
};
