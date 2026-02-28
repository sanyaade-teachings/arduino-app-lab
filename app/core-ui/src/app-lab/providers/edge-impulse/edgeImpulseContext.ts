import { UseEdgeImpulseAccountLogic } from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { createContext } from 'react';

export type EdgeImpulseContextValue = ReturnType<UseEdgeImpulseAccountLogic>;

const EdgeImpulseContextValue: EdgeImpulseContextValue =
  {} as EdgeImpulseContextValue;

export const EdgeImpulseContext = createContext<EdgeImpulseContextValue>(
  EdgeImpulseContextValue,
);
