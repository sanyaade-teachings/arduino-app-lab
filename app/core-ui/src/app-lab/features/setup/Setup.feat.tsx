import { AppLabSetup } from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { useCallback } from 'react';

import { UseBoards } from '../../hooks/useBoards';
import { useReloadApp } from '../../hooks/useReloadApp';
import { createUseSetupLogic } from './setup.logic';

interface SetupProps {
  boardsProps: ReturnType<UseBoards>;
}

const Setup: React.FC<SetupProps> = ({ boardsProps }: SetupProps) => {
  useReloadApp({
    boardsProps,
    showRoutes: false, // Setup non mostra routes
    apps: undefined,
    currentSection: undefined,
  });

  const setupLogic = useCallback(
    () => createUseSetupLogic(boardsProps)(),
    [boardsProps],
  );
  return <AppLabSetup setupLogic={setupLogic} />;
};

export default Setup;
