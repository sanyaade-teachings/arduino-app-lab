import {
  AppDetailedInfo,
  CreateAppRequest,
} from '@cloud-editor-mono/infrastructure';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  Button,
  ButtonVariant,
  EmojiPicker,
  SnackbarProps,
} from '../../../components-by-app/app-lab';
import { Input } from '../../../essential/input';
import { InputStyle } from '../../../essential/input';
import { useI18n } from '../../../i18n/useI18n';
import { XXXSmall } from '../../../typography';
import { AppLabDialog } from '../app-lab-dialog/AppLabDialog';
import { renameAppDialogMessages as messages } from '../messages';
import styles from './rename-app-dialog.module.scss';

export type RenameAppDialogLogic = () => {
  open: boolean;
  app?: AppDetailedInfo;
  confirmAction: (request: CreateAppRequest) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  sendNotification: (props: Omit<SnackbarProps, 'onClose' | 'toastId'>) => void;
};

type RenameAppDialogProps = { logic: RenameAppDialogLogic };

const MAX_LENGTH = 80;

export const RenameAppDialog: React.FC<RenameAppDialogProps> = ({
  logic,
}: RenameAppDialogProps) => {
  const { open, app, confirmAction, onOpenChange, sendNotification } = logic();
  const [name, setName] = useState(app?.name ?? '');
  const [icon, setIcon] = useState(app?.icon ?? '😀');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (app) {
      setName(app.name ?? '');
      setIcon(app.icon ?? '😀');
    } else if (!open) {
      setName('');
      setIcon('😀');
    }
    setHasError(false);
  }, [app, open]);

  const { formatMessage } = useI18n();

  const onAppNameChange = (value: string): void => {
    if (value.length > MAX_LENGTH) return;
    setName(value);
    setHasError(false);
  };

  const { mutateAsync: handleRenameApp, isLoading } = useMutation(
    ['rename-app'],
    async () => {
      const result = await confirmAction({ icon, name });
      if (result) {
        onOpenChange(false);
        sendNotification({
          message: formatMessage(messages.successRename),
          variant: 'success',
        });
      } else {
        setHasError(true);
      }
    },
  );

  return (
    <>
      {createPortal(
        <AppLabDialog
          open={open}
          onOpenChange={onOpenChange}
          title={formatMessage(messages.dialogTitle)}
          onSubmit={handleRenameApp}
          footer={
            <>
              <Button
                variant={ButtonVariant.Secondary}
                onClick={(): void => onOpenChange(false)}
              >
                {formatMessage(messages.cancelButton)}
              </Button>
              <Button
                variant={ButtonVariant.Primary}
                loading={isLoading}
                disabled={name.length === 0}
                type="submit"
              >
                {formatMessage(messages.confirmButton)}
              </Button>
            </>
          }
          classes={{
            body: styles['body'],
          }}
        >
          <EmojiPicker
            value={icon}
            onChange={setIcon}
            classes={{
              emojiPickerButton: styles['emoji-picker-button'],
              emojiPickerButtonOpen: styles['emoji-picker-button-open'],
              emojiPickerContainer: styles['emoji-picker'],
            }}
          />
          <div className={styles['app-name']}>
            <Input
              inputStyle={InputStyle.AppLab}
              type="text"
              value={name}
              onChange={onAppNameChange}
              error={
                hasError
                  ? new Error(formatMessage(messages.appNameInUse))
                  : undefined
              }
              placeholder={formatMessage(messages.inputPlaceholder)}
              /* eslint-disable-next-line jsx-a11y/no-autofocus */
              autoFocus
              classes={{
                input: styles['app-name-input'],
                inputContainer: styles['app-name-input-container'],
                error: styles['app-name-input-error'],
                inputError: styles['error-message'],
              }}
              after={
                <XXXSmall className={styles['app-name-length']}>
                  {[name.length, MAX_LENGTH].join(' / ')}
                </XXXSmall>
              }
            />
          </div>
        </AppLabDialog>,
        document.body,
      )}
    </>
  );
};
