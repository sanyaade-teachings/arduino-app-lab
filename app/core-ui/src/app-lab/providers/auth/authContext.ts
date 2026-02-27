import { UseArduinoAccountLogic } from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { createContext } from 'react';

export type AuthContextValue = ReturnType<UseArduinoAccountLogic>;

const AuthContextValue: AuthContextValue = {} as AuthContextValue;

export const AuthContext = createContext<AuthContextValue>(AuthContextValue);
