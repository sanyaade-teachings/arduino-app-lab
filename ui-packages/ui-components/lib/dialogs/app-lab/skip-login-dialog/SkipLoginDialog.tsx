import {
  Button,
  ButtonSize,
  ButtonVariant,
  Medium,
  useI18n,
  XSmall,
} from '../../../components-by-app/app-lab';
import { AppLabDialog } from '../app-lab-dialog/AppLabDialog';
import { skipLoginDialogMessages } from '../messages';
import styles from './skip-login-dialog.module.scss';

interface SkipLoginDialogProps {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const SkipLoginDialog: React.FC<SkipLoginDialogProps> = (
  props: SkipLoginDialogProps,
) => {
  const { open, onConfirm, onClose } = props;

  const { formatMessage } = useI18n();

  return (
    <AppLabDialog
      title={formatMessage(skipLoginDialogMessages.dialogTitle)}
      open={open}
      closeable={true}
      onOpenChange={(): void => onClose()}
      footer={
        <>
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.XSmall}
            onClick={(): void => onConfirm()}
          >
            {formatMessage(skipLoginDialogMessages.skipButton)}
          </Button>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.XSmall}
            onClick={(): void => onClose()}
          >
            {formatMessage(skipLoginDialogMessages.confirmButton)}
          </Button>
        </>
      }
      classes={{
        body: styles['body'],
      }}
    >
      <Medium bold>
        {formatMessage(skipLoginDialogMessages.dialogBodyTitle)}
      </Medium>
      <XSmall>
        {formatMessage(skipLoginDialogMessages.dialogBodyDescription)}
      </XSmall>
      <XSmall>
        <ul>
          <li>{formatMessage(skipLoginDialogMessages.dialogBodyListItem1)}</li>
          <li>{formatMessage(skipLoginDialogMessages.dialogBodyListItem2)}</li>
          <li>{formatMessage(skipLoginDialogMessages.dialogBodyListItem3)}</li>
          <li>{formatMessage(skipLoginDialogMessages.dialogBodyListItem4)}</li>
        </ul>
      </XSmall>
      <XSmall>{formatMessage(skipLoginDialogMessages.dialogBodyFooter)}</XSmall>
    </AppLabDialog>
  );
};

export default SkipLoginDialog;
