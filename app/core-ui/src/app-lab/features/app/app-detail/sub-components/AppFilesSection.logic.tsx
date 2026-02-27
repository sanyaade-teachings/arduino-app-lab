import {
  getBrickDetails,
  getFileContent,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import {
  BrickCreateUpdateRequest,
  BrickInstance,
  BrickListItem,
} from '@cloud-editor-mono/infrastructure';
import {
  AddAppBrickDialogLogic,
  BrickDetailLogic,
  DeleteAppBrickDialogLogic,
  UseArduinoAccountLogic,
  UseEdgeImpulseAccountLogic,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { useCallback, useContext, useState } from 'react';

import { AuthContext } from '../../../../providers/auth/authContext';
import {
  BoardResourcesContext,
  BoardResourcesContextValue,
} from '../../../../providers/board-resources/boardResourcesContext';
import { EdgeImpulseContext } from '../../../../providers/edge-impulse/edgeImpulseContext';
import { EdgeImpulseModelsContextValue } from '../../../../providers/edge-impulse-models/edgeImpulseModelsContext';

interface UseAppFilesSectionLogicProps {
  appBricks: BrickInstance[] | undefined;
  bricks: BrickListItem[] | undefined;
  addAppBrick(brickId: string): Promise<boolean>;
  deleteAppBrick(brickId: string): Promise<boolean>;
  loadAppBrick(brickId: string): Promise<BrickInstance>;
  updateAppBrick(
    brickId: string,
    params: BrickCreateUpdateRequest,
  ): Promise<boolean>;
  openExternalLink: (url: string) => void;
  edgeImpulseValue: EdgeImpulseModelsContextValue;
}

interface UseAppFilesSectionLogicReturn {
  addAppBrickDialogLogic: AddAppBrickDialogLogic;
  openAddAppBrickDialog: () => void;
  deleteAppBrickDialogLogic: DeleteAppBrickDialogLogic;
  openDeleteAppBrickDialog: (brick: BrickInstance) => void;
}

export const useAppFilesSectionLogic = function (
  props: UseAppFilesSectionLogicProps,
): UseAppFilesSectionLogicReturn {
  const {
    appBricks,
    bricks,
    addAppBrick,
    deleteAppBrick,
    loadAppBrick,
    updateAppBrick,
    openExternalLink,
    edgeImpulseValue,
  } = props;

  const [addAppBrickDialogOpen, setAddAppBrickDialogOpen] = useState(false);
  const [deleteAppBrickDialogOpen, setDeleteAppBrickDialogOpen] =
    useState(false);
  const [deletingAppBrick, setDeletingAppBrick] =
    useState<BrickInstance | null>(null);

  const useArduinoAuthAccountLogic = (): ReturnType<UseArduinoAccountLogic> =>
    useContext(AuthContext);
  const arduinoAuthAccountLogic = useCallback(useArduinoAuthAccountLogic, []);

  const useEdgeImpulseAuthAccountLogic =
    (): ReturnType<UseEdgeImpulseAccountLogic> =>
      useContext(EdgeImpulseContext);
  const edgeImpulseAuthAccountLogic = useCallback(
    useEdgeImpulseAuthAccountLogic,
    [],
  );

  const useBoardResourcesLogic = (): BoardResourcesContextValue =>
    useContext(BoardResourcesContext);
  const boardResourcesLogic = useCallback(useBoardResourcesLogic, []);

  const useBrickDetailLogic = (): ReturnType<BrickDetailLogic> => ({
    showConfigure: false,
    edgeImpulseProps: edgeImpulseValue,
    boardResourcesLogic,
    loadBrickDetails: getBrickDetails,
    loadBrickInstance: loadAppBrick,
    loadFileContent: getFileContent,
    onOpenExternalLink: openExternalLink,
    updateBrickDetails: updateAppBrick,
    arduinoAuthAccountLogic,
    edgeImpulseAuthAccountLogic,
  });

  const brickDetailLogic = useCallback(useBrickDetailLogic, [
    edgeImpulseValue,
    loadAppBrick,
    openExternalLink,
    updateAppBrick,
    arduinoAuthAccountLogic,
    edgeImpulseAuthAccountLogic,
    boardResourcesLogic,
  ]);

  const useAddAppBrickDialogLogic = (): ReturnType<AddAppBrickDialogLogic> => {
    return {
      open: addAppBrickDialogOpen,
      appBricks: appBricks || [],
      bricks: bricks || [],
      onOpenChange: setAddAppBrickDialogOpen,
      brickDetailLogic,
      confirmAction: (brick: BrickListItem): Promise<boolean> => {
        if (!brick.id) return Promise.resolve(false);
        return addAppBrick(brick.id);
      },
      arduinoAuthAccountLogic,
      edgeImpulseAuthAccountLogic,
      openAndAssociateToDevice: edgeImpulseValue.openAndAssociateToDevice,
      boardResourcesLogic,
    };
  };
  const addAppBrickDialogLogic = useCallback(useAddAppBrickDialogLogic, [
    addAppBrickDialogOpen,
    appBricks,
    bricks,
    brickDetailLogic,
    arduinoAuthAccountLogic,
    edgeImpulseAuthAccountLogic,
    addAppBrick,
    edgeImpulseValue.openAndAssociateToDevice,
    boardResourcesLogic,
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

  return {
    addAppBrickDialogLogic,
    openAddAppBrickDialog,
    deleteAppBrickDialogLogic,
    openDeleteAppBrickDialog,
  };
};
