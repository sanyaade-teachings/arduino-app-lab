import { AddSketchLibraryDialogLogic } from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { useCallback, useState } from 'react';

import { useBoardLifecycleStore } from '../../../../store/boardLifecycle';
import { UseSketchLibraries } from './useSketchLibraries';

interface UseAddSketchLibraryDialogParams {
  libraries?: UseSketchLibraries['libraries'];
  librarySearchIsLoading: UseSketchLibraries['librarySearchIsLoading'];
  searchSketchLibraries: UseSketchLibraries['searchSketchLibraries'];
  appLibrariesById: UseSketchLibraries['appLibrariesById'];
  installingLibraryId?: UseSketchLibraries['installingLibraryId'];
  addSketchLibrary: UseSketchLibraries['addSketchLibrary'];
  deletingLibraryId?: UseSketchLibraries['deletingLibraryId'];
  deleteSketchLibrary: UseSketchLibraries['deleteSketchLibrary'];
  addSketchLibraryError?: UseSketchLibraries['addSketchLibraryError'];
  openExternalLink: (url: string) => void;
  isBoard?: boolean;
}

export type UseAddSketchLibraryDialogLogic = () => {
  open: boolean;
  onOpenChange: (value: boolean) => void;
} & UseAddSketchLibraryDialogParams;

export type UseAddSketchLibraryDialog = (
  params: UseAddSketchLibraryDialogParams,
) => {
  openDialog: () => void;
  dialogLogic: UseAddSketchLibraryDialogLogic;
};

export const useAddSketchLibraryDialog: UseAddSketchLibraryDialog = (
  params,
) => {
  const [open, setOpen] = useState(false);
  const openDialog = useCallback(() => setOpen(true), []);
  const onOpenChange = (value: boolean): void => setOpen(value);

  const selectedBoard = useBoardLifecycleStore(
    (state) => state.selectedConnectedBoard,
  );

  const useDialogLogic: AddSketchLibraryDialogLogic = () => ({
    open,
    onOpenChange,
    board: selectedBoard,
    ...params,
  });
  const dialogLogic = useCallback(useDialogLogic, [
    open,
    params,
    selectedBoard,
  ]);

  return {
    openDialog,
    dialogLogic,
  };
};
