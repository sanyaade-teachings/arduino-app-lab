import { EdgeImpulseContext } from './edgeImpulseContext';
import { useEdgeImpulse } from './edgeImpulseContextProvider.logic';

interface EdgeImpulseContextProviderProps {
  children?: React.ReactNode;
}

const EdgeImpulseContextProvider: React.FC<EdgeImpulseContextProviderProps> = ({
  children,
}: EdgeImpulseContextProviderProps) => {
  return (
    <EdgeImpulseContext.Provider value={useEdgeImpulse()}>
      {children}
    </EdgeImpulseContext.Provider>
  );
};

export default EdgeImpulseContextProvider;
