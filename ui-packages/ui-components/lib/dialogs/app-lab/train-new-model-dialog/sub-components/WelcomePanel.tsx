import { CreateNewModel } from '@cloud-editor-mono/images/assets/icons';
import { useState } from 'react';

import {
  Button,
  ButtonSize,
  ButtonVariant,
  Medium,
  Small,
  useI18n,
  XSmall,
} from '../../../../components-by-app/app-lab';
import { Checkbox } from '../../../../essential/checkbox';
import { trainNewModelDialogMessages as messages } from '../../messages';
import styles from '../train-new-model-dialog.module.scss';

interface WelcomePanelProps {
  onStart: (dismissFuture: boolean) => void;
}

const WelcomePanel: React.FC<WelcomePanelProps> = (
  props: WelcomePanelProps,
) => {
  const { onStart } = props;

  const [dontShowAgain, setDontShowAgain] = useState(false);

  const { formatMessage } = useI18n();

  const welcomeSteps = [
    {
      text: messages.trainModelWelcomeDescriptionOne,
      bold: messages.edgeImpulseStudio,
    },
    {
      text: messages.trainModelWelcomeDescriptionTwo,
    },
    {
      text: messages.trainModelWelcomeDescriptionThree,
      bold: messages.arduinoAiBrick,
    },
  ];

  return (
    <>
      <div className={styles['illustration']}>
        <CreateNewModel />
      </div>
      <div className={styles['details']}>
        <Medium bold>{formatMessage(messages.trainModelWelcomeTitle)}</Medium>
        <ul className={styles['items-list']}>
          {welcomeSteps.map((msg) => (
            <li key={msg.text.id} className={styles['item']}>
              <Small>
                {formatMessage(msg.text, {
                  bold: msg.bold ? (
                    <Small bold>{formatMessage(msg.bold)}</Small>
                  ) : null,
                })}
              </Small>
            </li>
          ))}
        </ul>
        <Checkbox
          isSelected={dontShowAgain}
          onChange={(isSelected): void => setDontShowAgain(isSelected)}
        >
          <XSmall>{formatMessage(messages.dontShowAgain)}</XSmall>
        </Checkbox>
        <div className={styles['footer']}>
          {
            // TODO: Introduce 'Learn more' button when related content page is available
            /* <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.XSmall}
            classes={{ button: styles['button'] }}
            {formatMessage(messages.letsStart)}
          >
            {formatMessage(messages.learnMore)}
          </Button> */
          }
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.XSmall}
            onClick={(): void => onStart(dontShowAgain)}
            classes={{ button: styles['button'] }}
          >
            {formatMessage(messages.letsStart)}
          </Button>
        </div>
      </div>
    </>
  );
};

export default WelcomePanel;
