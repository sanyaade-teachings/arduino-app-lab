import { ExitButton } from '@cloud-editor-mono/images/assets/icons';
import { clsx } from 'clsx';
import { useCallback, useState } from 'react';

import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
  UseArduinoAccountLogic,
  UseEdgeImpulseAccountLogic,
  useI18n,
} from '../../../components-by-app/app-lab';
import { AppLabDialog } from '../app-lab-dialog/AppLabDialog';
import { trainNewModelDialogMessages as messages } from '../messages';
import ConnectionPanel from './sub-components/ConnectionPanel';
import WelcomePanel from './sub-components/WelcomePanel';
import styles from './train-new-model-dialog.module.scss';

type TrainNewModelDialogProps = {
  arduinoAuthAccountLogic: UseArduinoAccountLogic;
  edgeImpulseAuthAccountLogic: UseEdgeImpulseAccountLogic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openAndAssociateToDevice?: () => void;
};

export const TrainNewModelDialog: React.FC<TrainNewModelDialogProps> = (
  props: TrainNewModelDialogProps,
) => {
  const {
    arduinoAuthAccountLogic,
    edgeImpulseAuthAccountLogic,
    open,
    onOpenChange,
    openAndAssociateToDevice,
  } = props;

  const { formatMessage } = useI18n();

  const {
    login: arduinoLogin,
    user: arduinoUser,
    isWelcomePageDismissed,
    dismissWelcomePage,
  } = arduinoAuthAccountLogic();

  const { login: edgeImpulseLogin, user: edgeImpulseUser } =
    edgeImpulseAuthAccountLogic();

  const [showWelcomePage, setShowWelcomePage] = useState(true);

  const isArduinoConnected = !!arduinoUser;
  const isEdgeImpulseConnected = !!edgeImpulseUser;
  const shouldShowWelcome = !isWelcomePageDismissed && showWelcomePage;

  const handleStartWelcome = useCallback(
    (shouldDismissFuture: boolean): void => {
      setShowWelcomePage(false);
      if (shouldDismissFuture) {
        dismissWelcomePage();
      }
    },
    [dismissWelcomePage],
  );

  const handleOpenEdgeImpulse = useCallback(() => {
    openAndAssociateToDevice && openAndAssociateToDevice();
    onOpenChange(false);
  }, [onOpenChange, openAndAssociateToDevice]);

  return (
    <AppLabDialog
      open={open}
      closeable={false}
      onOpenChange={onOpenChange}
      title={
        <Button
          type={ButtonType.Secondary}
          size={ButtonSize.XSmall}
          variant={ButtonVariant.LowContrast}
          onClick={(): void => onOpenChange(false)}
          Icon={ExitButton}
          classes={{ button: styles['exit-button'] }}
        >
          {formatMessage(messages.exitDialog)}
        </Button>
      }
      classes={{
        root: styles['root'],
        content: styles['content'],
        body: styles['body'],
        header: styles['body-header'],
      }}
    >
      <div className={styles['body-content']}>
        <div
          className={clsx(styles['panel'], {
            [styles['is-welcome']]: shouldShowWelcome,
          })}
        >
          {shouldShowWelcome ? (
            <WelcomePanel onStart={handleStartWelcome} />
          ) : (
            <ConnectionPanel
              isArduinoConnected={isArduinoConnected}
              isEdgeImpulseConnected={isEdgeImpulseConnected}
              onArduinoLogin={arduinoLogin}
              onEdgeImpulseLogin={edgeImpulseLogin}
              onOpenEdgeImpulse={handleOpenEdgeImpulse}
            />
          )}
        </div>
      </div>
    </AppLabDialog>
  );
};
