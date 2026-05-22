import { Button, ButtonVariant } from '../../../components-by-app/app-lab';
import { useI18n } from '../../../i18n/useI18n';
import { Medium, XSmall } from '../../../typography';
import { AppLabDialog } from '../app-lab-dialog/AppLabDialog';
import { unsupportedCarrierDialogMessages as messages } from '../messages';
import styles from './unsupported-carrier-dialog.module.scss';

export type UnsupportedCarrierDialogLogic = () => {
  open: boolean;
  confirm: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
};

type UnsupportedCarrierDialogProps = { logic: UnsupportedCarrierDialogLogic };

export const UnsupportedCarrierDialog: React.FC<
  UnsupportedCarrierDialogProps
> = ({ logic }: UnsupportedCarrierDialogProps) => {
  const { open, confirm, onOpenChange } = logic();

  const closeDialog = (): void => {
    onOpenChange(false);
  };

  const { formatMessage } = useI18n();

  return (
    <AppLabDialog
      open={open}
      onOpenChange={(open): void => (open ? onOpenChange(open) : closeDialog())}
      title={formatMessage(messages.dialogTitle)}
      onSubmit={confirm}
      footer={
        <Button variant={ButtonVariant.Primary} type="submit">
          {formatMessage(messages.confirmButton)}
        </Button>
      }
      classes={{
        root: styles['root'],
        content: styles['content'],
        body: styles['body'],
      }}
    >
      <div className={styles['container']}>
        <Medium className={styles['title']}>
          {formatMessage(messages.dialogBodyTitle)}
        </Medium>
        <XSmall>{formatMessage(messages.dialogBodyDescription)}</XSmall>
      </div>
    </AppLabDialog>
  );
};
