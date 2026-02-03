import {
  flash,
  getAvailableFreeSpace,
  getBoards,
  isUserPartitionPreservationSupported,
  listAvailableOSImages,
  openLinkExternal,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useBoardLifecycleStore } from '../../store/boards/boards';
import { UseFlasherLogic } from './flasher.type';

const ARDUINO_SUPPORT_URL = 'https://www.arduino.cc/en/contact-us/';

export const useFlasherLogic: UseFlasherLogic = function (
  selectBoard: (boardId: string) => Promise<void>,
): ReturnType<UseFlasherLogic> {
  const { selectedConnectedBoard, setBoardIsFlashing } =
    useBoardLifecycleStore();
  const flashingBoard = useMemo(
    () => selectedConnectedBoard!,
    [selectedConnectedBoard],
  );

  const { data: boards } = useQuery(['list-boards'], getBoards, {
    refetchOnWindowFocus: false,
    refetchInterval: 1000,
  });

  return {
    loading: boards?.every((b) => b.serial !== flashingBoard.serial) ?? true,
    close: (): void => {
      setBoardIsFlashing(false);
      if (selectedConnectedBoard) {
        selectBoard(selectedConnectedBoard.id);
      }
    },
    listAvailableImages: listAvailableOSImages,
    getAvailableFreeSpace: getAvailableFreeSpace,
    getUserPartitionPreservationSupported: isUserPartitionPreservationSupported,
    flashBoard: flash,
    openArduinoSupport: (): void => {
      openLinkExternal(ARDUINO_SUPPORT_URL);
    },
  };
};
