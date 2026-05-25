import { getBrickDetails } from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import {
  BrickCreateUpdateRequest,
  BrickInstance,
  BrickListItem,
} from '@cloud-editor-mono/infrastructure';
import {
  AddAppBrickDialogLogic,
  BrickDetailLogic,
  ConfigureAppBrickDialogLogic,
  DeleteAppBrickDialogLogic,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { useCallback, useState } from 'react';

import { CustomBrickDialogLogic } from '../../../dialogs/app-lab/add-app-brick-dialog/sub-components/CustomBrickDialog';

interface UseAppFilesSectionLogicParams {
  appId: string;
  appBricks: BrickInstance[] | undefined;
  bricks: BrickListItem[] | undefined;
  openExternalLink: (url: string) => void;
  addAppBrick(
    brickId: string,
    params?: BrickCreateUpdateRequest,
    isCustom?: boolean,
  ): Promise<boolean>;
  deleteAppBrick(brickId: string): Promise<boolean>;
  updateAppBrick(
    brickId: string,
    params: BrickCreateUpdateRequest,
  ): Promise<boolean>;
  brickDetailLogic: BrickDetailLogic;
  configureAppBrickDialogLogic: ConfigureAppBrickDialogLogic;
  addAppCustomBrick: (
    appId: string,
    params: {
      name: string;
      description?: string;
    },
  ) => Promise<{ id: string } | undefined>;
  renameAppCustomBrick(
    brickId: string,
    params: { name: string },
  ): Promise<boolean>;
}

type UseAppFilesSectionLogic = (params: UseAppFilesSectionLogicParams) => {
  addAppBrickDialogLogic: AddAppBrickDialogLogic;
  openAddAppBrickDialog: () => void;
  deleteAppBrickDialogLogic: DeleteAppBrickDialogLogic;
  openDeleteAppBrickDialog: (brick: BrickInstance) => void;
  renameAppBrickDialogLogic: CustomBrickDialogLogic;
  openRenameAppBrickDialog: (brick: BrickInstance) => void;
};

export const useAppFilesSectionLogic: UseAppFilesSectionLogic = function (
  params: UseAppFilesSectionLogicParams,
): ReturnType<UseAppFilesSectionLogic> {
  const {
    appId,
    appBricks,
    bricks,
    addAppBrick,
    deleteAppBrick,
    addAppCustomBrick,
    configureAppBrickDialogLogic,
    brickDetailLogic,
    renameAppCustomBrick,
    openExternalLink,
  } = params;

  const [addAppBrickDialogOpen, setAddAppBrickDialogOpen] = useState(false);
  const [deleteAppBrickDialogOpen, setDeleteAppBrickDialogOpen] =
    useState(false);
  const [deletingAppBrick, setDeletingAppBrick] =
    useState<BrickInstance | null>(null);
  const [createAppBrickDialogOpen, setCreateAppAppBrickDialogOpen] =
    useState(false);
  const [renameAppBrickDialogOpen, setRenameAppAppBrickDialogOpen] =
    useState(false);
  const [renamingAppBrick, setRenamingAppBrick] =
    useState<BrickInstance | null>(null);

  const useCreateAppBrickDialogLogic =
    (): ReturnType<CustomBrickDialogLogic> => {
      return {
        open: createAppBrickDialogOpen,
        onOpenChange: setCreateAppAppBrickDialogOpen,
        confirmAction: async (name): Promise<boolean> => {
          if (!createAppBrickDialogOpen) return Promise.resolve(false);
          const result = await addAppCustomBrick(appId, {
            name,
            description: name,
          });
          setAddAppBrickDialogOpen(false);
          if (!result) {
            setCreateAppAppBrickDialogOpen(false);
          }
          return result
            ? addAppBrick(result.id, undefined, true)
            : Promise.resolve(false);
        },
      };
    };

  const createAppBrickDialogLogic = useCallback(useCreateAppBrickDialogLogic, [
    createAppBrickDialogOpen,
    addAppCustomBrick,
    appId,
    addAppBrick,
  ]);

  const openCreateAppBrickDialog = useCallback(() => {
    setCreateAppAppBrickDialogOpen(true);
  }, []);

  const useAddAppBrickDialogLogic = (): ReturnType<AddAppBrickDialogLogic> => {
    return {
      open: addAppBrickDialogOpen,
      appId,
      appBricks: appBricks || [],
      bricks: bricks || [],
      onOpenChange: setAddAppBrickDialogOpen,
      brickDetailLogic,
      configureDialogLogic: configureAppBrickDialogLogic,
      loadBrickDetails: getBrickDetails,
      confirmAddAppBrick: (
        brickId: string,
        modelId?: string,
      ): Promise<boolean> => {
        return addAppBrick(brickId, modelId ? { model: modelId } : undefined);
      },
      openCreateAppBrickDialog,
      createAppBrickDialogLogic,
      createAppBrickDialogOpen,
      onOpenExternal: openExternalLink,
    };
  };
  const addAppBrickDialogLogic = useCallback(useAddAppBrickDialogLogic, [
    addAppBrickDialogOpen,
    appId,
    appBricks,
    bricks,
    brickDetailLogic,
    configureAppBrickDialogLogic,
    openCreateAppBrickDialog,
    createAppBrickDialogLogic,
    createAppBrickDialogOpen,
    addAppBrick,
    openExternalLink,
  ]);

  const openAddAppBrickDialog = useCallback(() => {
    setAddAppBrickDialogOpen(true);
  }, []);

  const useDeleteAppBrickDialogLogic =
    (): ReturnType<DeleteAppBrickDialogLogic> => {
      return {
        brick: deletingAppBrick,
        open: deleteAppBrickDialogOpen,
        onOpenChange: setDeleteAppBrickDialogOpen,
        confirmAction: (brickId): Promise<boolean> => {
          if (!deleteAppBrickDialogOpen) return Promise.resolve(false);
          return deleteAppBrick(brickId);
        },
      };
    };

  const deleteAppBrickDialogLogic = useCallback(useDeleteAppBrickDialogLogic, [
    deletingAppBrick,
    deleteAppBrickDialogOpen,
    setDeleteAppBrickDialogOpen,
    deleteAppBrick,
  ]);

  const openDeleteAppBrickDialog = useCallback((brick: BrickInstance) => {
    setDeletingAppBrick(brick);
    setDeleteAppBrickDialogOpen(true);
  }, []);

  const useRenameAppBrickDialogLogic =
    (): ReturnType<CustomBrickDialogLogic> => {
      return {
        open: renameAppBrickDialogOpen,
        onOpenChange: setRenameAppAppBrickDialogOpen,
        confirmAction: (name, brickId): Promise<boolean> => {
          if (!renameAppBrickDialogOpen) return Promise.resolve(false);
          return renameAppCustomBrick(brickId ?? '', { name });
        },
        isRename: true,
        brick: renamingAppBrick,
      };
    };

  const renameAppBrickDialogLogic = useCallback(useRenameAppBrickDialogLogic, [
    renameAppBrickDialogOpen,
    renamingAppBrick,
    renameAppCustomBrick,
  ]);

  const openRenameAppBrickDialog = useCallback((brick: BrickInstance) => {
    setRenamingAppBrick(brick);
    setRenameAppAppBrickDialogOpen(true);
  }, []);

  return {
    addAppBrickDialogLogic,
    openAddAppBrickDialog,
    deleteAppBrickDialogLogic,
    openDeleteAppBrickDialog,
    renameAppBrickDialogLogic,
    openRenameAppBrickDialog,
  };
};
