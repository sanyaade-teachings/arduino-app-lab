import { appLabMediaCarrier } from '@cloud-editor-mono/images/assets/images/images-by-app/app-lab';
import { useState } from 'react';

import { Button, ButtonVariant } from '../../../components-by-app/app-lab';
import { Checkbox } from '../../../essential/checkbox';
import { useI18n } from '../../../i18n/useI18n';
import { Medium, XSmall } from '../../../typography';
import { AppLabDialog } from '../app-lab-dialog/AppLabDialog';
import { attachCarrierDialogMessages as messages } from '../messages';
import styles from './attach-carrier-dialog.module.scss';

export type AttachCarrierDialogLogic = () => {
  open: boolean;
  confirm: (remember: boolean) => Promise<void>;
  onOpenChange: (open: boolean) => void;
};

type AttachCarrierDialogProps = { logic: AttachCarrierDialogLogic };

export const AttachCarrierDialog: React.FC<AttachCarrierDialogProps> = ({
  logic,
}: AttachCarrierDialogProps) => {
  const { open, confirm, onOpenChange } = logic();
  const [remember, setRemember] = useState(false);

  const closeDialog = (): void => {
    onOpenChange(false);
    setRemember(false);
  };

  const { formatMessage } = useI18n();

  const handleConfirm = (): void => {
    confirm(remember);
  };

  return (
    <AppLabDialog
      open={open}
      onOpenChange={(open): void => (open ? onOpenChange(open) : closeDialog())}
      title={formatMessage(messages.dialogTitle)}
      onSubmit={handleConfirm}
      classes={{
        root: styles['root'],
        content: styles['content'],
        body: styles['body'],
      }}
    >
      <div className={styles['image-container']}>{appLabMediaCarrier}</div>
      <div className={styles['container']}>
        <div className={styles['description-container']}>
          <Medium className={styles['title']}>
            {formatMessage(messages.dialogBodyTitle)}
          </Medium>
          <XSmall>
            {formatMessage(messages.dialogBodyDescription1, {
              bold: (text: string) => <strong>{text}</strong>,
            })}
          </XSmall>
          <XSmall>{formatMessage(messages.dialogBodyDescription2)}</XSmall>
        </div>
        <div className={styles['footer-container']}>
          <Checkbox
            isSelected={remember}
            onChange={(value): void => setRemember(value)}
          >
            {formatMessage(messages.rememberButton)}
          </Checkbox>
          <Button variant={ButtonVariant.Primary} type="submit">
            {formatMessage(messages.confirmButton)}
          </Button>
        </div>
      </div>
    </AppLabDialog>
  );
};
