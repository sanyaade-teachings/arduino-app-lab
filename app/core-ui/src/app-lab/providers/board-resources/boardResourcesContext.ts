import { BoardResourcesValue } from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { createContext, useContext } from 'react';

export type BoardResourcesContextValue = BoardResourcesValue;

const BoardResourcesContextValue: BoardResourcesContextValue =
  {} as BoardResourcesContextValue;

export const BoardResourcesContext = createContext<BoardResourcesContextValue>(
  BoardResourcesContextValue,
);

export const useBoardResources = (): BoardResourcesContextValue => {
  const context = useContext(BoardResourcesContext);

  if (!context) {
    throw new Error(
      'useBoardResourcesContext must be used within an BoardResourcesContextProvider',
    );
  }

  return context;
};
