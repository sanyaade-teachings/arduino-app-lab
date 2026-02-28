import { openBoardTerminal } from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import { useState } from 'react';

export interface UseTerminal {
  onOpenTerminal: () => Promise<void>;
  terminalError: string | null;
}

export const useTerminal = (): UseTerminal => {
  const [terminalError, setTerminalError] = useState<string | null>(null);

  const onOpenTerminal = async (): Promise<void> => {
    try {
      setTerminalError(null);
      await openBoardTerminal();
    } catch (e) {
      setTerminalError((e as Error).message);
      setTimeout(() => setTerminalError(null), 6000);
    }
  };

  return { onOpenTerminal, terminalError };
};
