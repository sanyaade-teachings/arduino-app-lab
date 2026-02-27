import { createContext } from 'react';

import { UseRuntimeLogic } from './runtimeContextProvider.type';

export type RuntimeContextValue = ReturnType<UseRuntimeLogic>;

const RuntimeContextValue: RuntimeContextValue = {} as RuntimeContextValue;

export const RuntimeContext =
  createContext<RuntimeContextValue>(RuntimeContextValue);
