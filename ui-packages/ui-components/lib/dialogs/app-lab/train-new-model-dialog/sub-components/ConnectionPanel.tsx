import {
  AccountCustomAiModels,
  ArduinoLoop,
  Exchange,
  LoginIllustration,
  LoginIllustrationArduinoConnected,
  LoginIllustrationEIConnected,
  OpenInNewTab,
  TrainModel,
} from '@cloud-editor-mono/images/assets/icons';
import { clsx } from 'clsx';
import { useMemo } from 'react';

import {
  Button,
  ButtonSize,
  ButtonType,
  Medium,
  useI18n,
  XSmall,
} from '../../../../components-by-app/app-lab';
import { trainNewModelDialogMessages as messages } from '../../messages';
import styles from '../train-new-model-dialog.module.scss';

interface ConnectionPanelProps {
  isArduinoConnected: boolean;
  isEdgeImpulseConnected: boolean;
  onArduinoLogin: () => void;
  onEdgeImpulseLogin: () => void;
  onOpenEdgeImpulse: () => void;
}

const ConnectionPanel: React.FC<ConnectionPanelProps> = (
  props: ConnectionPanelProps,
) => {
  const {
    isArduinoConnected,
    isEdgeImpulseConnected,
    onArduinoLogin,
    onEdgeImpulseLogin,
    onOpenEdgeImpulse,
  } = props;

  const { formatMessage } = useI18n();

  const allConnected = isArduinoConnected && isEdgeImpulseConnected;

  const mainButtonConfig = useMemo(() => {
    if (allConnected) {
      return {
        text: messages.startToTrainButton,
        icon: OpenInNewTab,
        action: onOpenEdgeImpulse,
      };
    }
    if (isArduinoConnected) {
      return {
        text: messages.connectToEdgeImpulse,
        icon: OpenInNewTab,
        action: onEdgeImpulseLogin,
      };
    }
    return {
      text: messages.arduinoSignIn,
      icon: ArduinoLoop,
      action: onArduinoLogin,
    };
  }, [
    allConnected,
    isArduinoConnected,
    onArduinoLogin,
    onOpenEdgeImpulse,
    onEdgeImpulseLogin,
  ]);

  return (
    <>
      <div className={styles['illustration']}>
        {allConnected ? (
          <LoginIllustrationEIConnected />
        ) : isArduinoConnected ? (
          <LoginIllustrationArduinoConnected />
        ) : (
          <LoginIllustration />
        )}
      </div>
      <div className={styles['details']}>
        <div className={styles['title']}>
          {!allConnected && (
            <div className={styles['icon']}>
              <TrainModel />
            </div>
          )}
          <div className={styles['text']}>
            <Medium bold>
              {allConnected
                ? formatMessage(messages.accountConnectedTitle)
                : formatMessage(messages.trainModelTitle)}
            </Medium>
            <XSmall className={styles['subtitle']}>
              {allConnected
                ? null
                : formatMessage(messages.trainModelDescription)}
            </XSmall>
          </div>
        </div>

        {allConnected ? (
          <ol className={styles['items-list']}>
            <li className={styles['item']}>
              <AccountCustomAiModels className={styles['icon']} />
              <XSmall bold>
                {formatMessage(messages.redirectToEdgeImpulse)}
              </XSmall>
            </li>
            <li className={styles['item']}>
              <TrainModel className={styles['icon']} />
              <XSmall bold>{formatMessage(messages.chooseModelType)}</XSmall>
            </li>
            <li className={styles['item']}>
              <Exchange className={styles['icon']} />
              <XSmall bold>{formatMessage(messages.modelInAppLab)}</XSmall>
            </li>
          </ol>
        ) : (
          <ol className={clsx(styles['items-list'], styles['steps'])}>
            <li
              className={clsx(styles['item'], {
                [styles['selected']]: !isArduinoConnected,
                [styles['completed']]: isArduinoConnected,
              })}
            >
              <XSmall bold={!isArduinoConnected}>
                {formatMessage(messages.stepOne)}
              </XSmall>
            </li>
            <li
              className={clsx(styles['item'], {
                [styles['selected']]:
                  isArduinoConnected && !isEdgeImpulseConnected,
                [styles['completed']]:
                  isArduinoConnected && isEdgeImpulseConnected,
              })}
            >
              <XSmall bold={isArduinoConnected && !isEdgeImpulseConnected}>
                {formatMessage(messages.stepTwo)}
              </XSmall>
            </li>
          </ol>
        )}

        <Button
          type={ButtonType.Primary}
          size={ButtonSize.XSmall}
          onClick={mainButtonConfig.action}
          Icon={mainButtonConfig.icon}
          classes={{ button: styles['button'] }}
        >
          {formatMessage(mainButtonConfig.text)}
        </Button>
      </div>
    </>
  );
};

export default ConnectionPanel;
