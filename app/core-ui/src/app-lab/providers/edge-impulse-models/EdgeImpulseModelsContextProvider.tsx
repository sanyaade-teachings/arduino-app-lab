import { EdgeImpulseModelsContext } from './edgeImpulseModelsContext';
import { useEdgeImpulseModelsLogic } from './edgeImpulseModelsContextProvider.logic';

interface EdgeImpulseModelsContextProviderProps {
  children?: React.ReactNode;
}

const EdgeImpulseModelsContextProvider: React.FC<
  EdgeImpulseModelsContextProviderProps
> = (props: EdgeImpulseModelsContextProviderProps) => {
  const { children } = props;

  return (
    <EdgeImpulseModelsContext.Provider
      value={useEdgeImpulseModelsLogic({ enabled: true })} // TODO: enable only when consumer requires it
    >
      {children}
    </EdgeImpulseModelsContext.Provider>
  );
};

export default EdgeImpulseModelsContextProvider;
