import { useState } from 'react';

export type UseSetup = () => {
  setupCompleted: boolean;
  setSetupCompleted: (completed: boolean) => void;
  networkStepSkipped: boolean;
  setNetworkStepSkipped: (skipped: boolean) => void;
};

export const useSetup: UseSetup = function (): ReturnType<UseSetup> {
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [networkStepSkipped, setNetworkStepSkipped] = useState(false);

  return {
    setupCompleted,
    setSetupCompleted,
    networkStepSkipped,
    setNetworkStepSkipped,
  };
};
