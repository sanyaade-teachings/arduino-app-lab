import { Success } from '@cloud-editor-mono/images/assets/icons';
import { forwardRef, useImperativeHandle, useState } from 'react';

import { UseLinuxCredentialsLogic } from '../../app-lab-settings';
import { Input } from '../../essential/input';
import { InputStyle } from '../../essential/input';
import { useI18n } from '../../i18n/useI18n';
import { XXSmall } from '../../typography';
import { linuxCredentialsMessages } from '../messages';
import setupStyles from '../setup.module.scss';
import styles from './linux-credentials.module.scss';

interface LinuxCredentialsProps {
  logic: ReturnType<UseLinuxCredentialsLogic>;
}

const LinuxCredentials = forwardRef((props: LinuxCredentialsProps, ref) => {
  const { logic } = props;
  const {
    setUserPassword,
    setUserPasswordIsLoading,
    setUserPasswordIsError,
    setUserPasswordIsSuccess,
    setUserPasswordConfirmationIsError,
    userPasswordErrorMsg,
    userPasswordConfirmationErrorMsg,
  } = logic;

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  useImperativeHandle(ref, () => ({
    confirm: (): void => setUserPassword(password, passwordConfirmation),
  }));

  const { formatMessage } = useI18n();

  return (
    <div className={styles['container']}>
      <div className={setupStyles['input-container']}>
        <Input
          id="username"
          value="arduino"
          inputStyle={InputStyle.AppLab}
          disabled
          label={formatMessage(linuxCredentialsMessages.usernameLabel)}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onChange={(): void => {}}
        />
      </div>
      <div className={setupStyles['input-container']}>
        <Input
          id="password"
          value={password}
          inputStyle={InputStyle.AppLab}
          disabled={setUserPasswordIsLoading}
          onChange={setPassword}
          label={formatMessage(linuxCredentialsMessages.passwordLabel)}
          sensitive
          error={
            setUserPasswordIsError ? new Error(userPasswordErrorMsg) : undefined
          }
          classes={{
            error: styles['input-error-state'],
            inputError: styles['input-error'],
          }}
        />
      </div>
      <div className={setupStyles['input-container']}>
        <Input
          id="password-confirmation"
          value={passwordConfirmation}
          inputStyle={InputStyle.AppLab}
          disabled={setUserPasswordIsLoading}
          onChange={setPasswordConfirmation}
          label={formatMessage(
            linuxCredentialsMessages.passwordConfirmationLabel,
          )}
          sensitive
          error={
            setUserPasswordConfirmationIsError
              ? new Error(userPasswordConfirmationErrorMsg)
              : undefined
          }
          classes={{
            error: styles['input-error-state'],
            inputError: styles['input-error'],
          }}
        />
        {setUserPasswordIsSuccess && (
          <XXSmall bold className={setupStyles['message']}>
            <Success />
            {formatMessage(linuxCredentialsMessages.linuxCredentialsSuccess)}
          </XXSmall>
        )}
      </div>
    </div>
  );
});

LinuxCredentials.displayName = 'LinuxCredentials';

export default LinuxCredentials;
