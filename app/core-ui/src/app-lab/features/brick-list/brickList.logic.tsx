import {
  getBrickDetails,
  getBricks,
  getFileContent,
  openLinkExternal,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import { BrickListItem } from '@cloud-editor-mono/infrastructure';
import {
  BoardResourcesValue,
  BrickDetailLogic,
  UseArduinoAccountLogic,
  UseEdgeImpulseAccountLogic,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useContext, useState } from 'react';

import { AuthContext } from '../../providers/auth/authContext';
import { BoardResourcesContext } from '../../providers/board-resources/boardResourcesContext';
import { EdgeImpulseContext } from '../../providers/edge-impulse/edgeImpulseContext';
import { useEdgeImpulseModels } from '../../providers/edge-impulse-models/edgeImpulseModelsContext';
import { UseBrickListLogic } from './brickList.type';

export const useBrickListLogic = function (): UseBrickListLogic {
  const [selectedBrick, setSelectedBrick] = useState<BrickListItem | null>(
    null,
  );

  const { data: bricks, isLoading: bricksAreLoading } = useQuery(
    ['list-bricks'],
    () => getBricks(),
    {
      onSuccess: (data) => {
        if (data.length > 0) {
          setSelectedBrick(data[0]);
        }
      },
    },
  );

  const edgeImpulseValue = useEdgeImpulseModels();

  const openExternalLink = useCallback((url: string) => {
    if (!url) {
      console.warn('No URL provided to open externally');
      return;
    }
    openLinkExternal(url);
  }, []);

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

  const useBoardResourcesLogic = (): BoardResourcesValue =>
    useContext(BoardResourcesContext);
  const boardResourcesLogic = useCallback(useBoardResourcesLogic, []);

  const useBrickDetailLogic = (): ReturnType<BrickDetailLogic> => ({
    edgeImpulseProps: edgeImpulseValue,
    boardResourcesLogic,
    loadBrickDetails: getBrickDetails,
    loadFileContent: getFileContent,
    onOpenExternalLink: openExternalLink,
    arduinoAuthAccountLogic,
    edgeImpulseAuthAccountLogic,
  });

  const brickDetailLogic = useCallback(useBrickDetailLogic, [
    edgeImpulseValue,
    openExternalLink,
    arduinoAuthAccountLogic,
    edgeImpulseAuthAccountLogic,
    boardResourcesLogic,
  ]);

  return {
    bricks: bricks || [],
    isLoading: bricksAreLoading,
    selectedBrick,
    brickDetailLogic,
    setSelectedBrick,
  };
};
