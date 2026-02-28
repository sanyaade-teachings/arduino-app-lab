import {
  flash,
  getAvailableFreeSpace,
  getBoards,
  isUserPartitionPreservationSupported,
  listAvailableOSImages,
  openLinkExternal,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useBoardLifecycleStore } from '../../store/boards/boards';
import { UseFlasherLogic } from './flasher.type';

const ARDUINO_SUPPORT_URL = 'https://www.arduino.cc/en/contact-us/';

export const useFlasherLogic: UseFlasherLogic = function (
  selectBoard: (boardId: string) => Promise<void>,
): ReturnType<UseFlasherLogic> {
  const { selectedConnectedBoard, setBoardIsFlashing } =
    useBoardLifecycleStore();
  const [succeeded, setSucceeded] = useState<boolean | null>(null);

  const { data: boards } = useQuery(['list-boards'], getBoards, {
    refetchInterval: 1000,
  });

  return {
    loading:
      boards?.every((b) => b.serial !== selectedConnectedBoard?.serial) ?? true,
    succeeded,
    setSucceeded,
    close: (): void => {
      if (succeeded) {
        selectBoard(selectedConnectedBoard?.id ?? '');
      } else {
        setBoardIsFlashing(false);
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
