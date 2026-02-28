import { BoardResourcesContext } from './boardResourcesContext';
import { useBoardResourcesLogic } from './boardResourcesContextProvider.logic';

interface BoardResourcesContextProviderProps {
  children?: React.ReactNode;
}

const BoardResourcesContextProvider: React.FC<
  BoardResourcesContextProviderProps
> = (props: BoardResourcesContextProviderProps) => {
  const { children } = props;

  return (
    <BoardResourcesContext.Provider value={useBoardResourcesLogic()}>
      {children}
    </BoardResourcesContext.Provider>
  );
};

export default BoardResourcesContextProvider;
