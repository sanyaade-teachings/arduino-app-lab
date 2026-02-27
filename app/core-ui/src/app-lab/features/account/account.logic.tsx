import { UseArduinoAccountLogic } from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { useContext } from 'react';

import { AuthContext } from '../../providers/auth/authContext';

export const createUseArduinoAccountLogic =
  function (): UseArduinoAccountLogic {
    return function useArduinoAccountLogic(): ReturnType<UseArduinoAccountLogic> {
      return useContext(AuthContext);
    };
  };
