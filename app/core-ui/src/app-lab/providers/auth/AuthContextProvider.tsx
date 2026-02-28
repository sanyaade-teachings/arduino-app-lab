import { AuthContext } from './authContext';
import { useAuth } from './authContextProvider.logic';

interface AuthContextProviderProps {
  children?: React.ReactNode;
}

const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
  children,
}: AuthContextProviderProps) => {
  return (
    <AuthContext.Provider value={useAuth()}>{children}</AuthContext.Provider>
  );
};

export default AuthContextProvider;
