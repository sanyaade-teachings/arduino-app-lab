import { createContext } from 'react';

import { UseSetup } from './setupContextProvider.logic';

export type SetupContextValue = ReturnType<UseSetup>;

const SetupContextValue: SetupContextValue = {
  setupCompleted: false,
  setSetupCompleted: () => {},
  networkStepSkipped: false,
  setNetworkStepSkipped: () => {},
} as SetupContextValue;

export const SetupContext = createContext<SetupContextValue>(SetupContextValue);
