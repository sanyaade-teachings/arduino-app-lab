import {
  FlashEvent,
  OSImageRelease,
} from '@cloud-editor-mono/domain/src/services/flasher-service';
import { Checkmark } from '@cloud-editor-mono/images/assets/icons';
import {
  AppLabDialog,
  useI18n,
  XSmall,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';

import { useFlasherLogic } from './flasher.logic';
import styles from './flasher.module.scss';
import { messages } from './messages';
import { FlasherConfiguration } from './steps/configuration/FlasherConfiguration';
import { FlasherFlashing } from './steps/flashing/FlasherFlashing';
import { FlasherPreparation } from './steps/preparation/FlasherPreparation';

enum FlashBoardStep {
  Configuration = 1,
  Preparation = 2,
  Flashing = 3,
}
const steps = [
  FlashBoardStep.Configuration,
  FlashBoardStep.Preparation,
  FlashBoardStep.Flashing,
];

interface FlasherProps {
  selectBoard: (boardId: string) => Promise<void>;
}

export const Flasher: React.FC<FlasherProps> = ({
  selectBoard,
}: FlasherProps) => {
  const { formatMessage } = useI18n();
  const [flashEvent, setFlashEvent] = useState<FlashEvent | null>(null);
  const [succeeded, setSucceeded] = useState<boolean | null>(null);

  const step = useMemo(() => {
    if (flashEvent?.step !== 'flashing') return FlashBoardStep.Configuration;
    return flashEvent.progress || flashEvent.log === 'completed'
      ? FlashBoardStep.Flashing
      : FlashBoardStep.Preparation;
  }, [flashEvent]);

  const {
    loading,
    close,
    listAvailableImages,
    getAvailableFreeSpace,
    getUserPartitionPreservationSupported,
    flashBoard,
    openArduinoSupport,
  } = useFlasherLogic(selectBoard);

  const handleFlash = useCallback(
    async (image: OSImageRelease, preserveData: boolean): Promise<void> => {
      try {
        await flashBoard(image, preserveData, (event) => {
          setFlashEvent(event);
          if (event.step === 'flashing' && event.log === 'completed') {
            setSucceeded(true);
          }
        });
        setSucceeded(true);
      } catch (error) {
        setFlashEvent({
          step: 'flashing',
          log:
            typeof error === 'string' ? error : formatMessage(messages.error),
          progress: 1,
        });
        setSucceeded(false);
      }
    },
    [flashBoard, formatMessage],
  );

  const handleRetry = useCallback((): void => {
    setFlashEvent(null);
    setSucceeded(null);
  }, []);

  const getTitle = (step: FlashBoardStep): string => {
    switch (step) {
      case FlashBoardStep.Configuration:
        return formatMessage(messages.configurationStepTitle);
      case FlashBoardStep.Preparation:
        return formatMessage(messages.preparationStepTitle);
      case FlashBoardStep.Flashing:
        return formatMessage(messages.flashingStepTitle);
    }
  };

  const getContent = (step: FlashBoardStep): React.ReactNode => {
    switch (step) {
      case FlashBoardStep.Configuration:
        return (
          <FlasherConfiguration
            flashEvent={flashEvent}
            loading={loading}
            listAvailableImages={listAvailableImages}
            getAvailableFreeSpace={getAvailableFreeSpace}
            getUserPartitionPreservationSupported={
              getUserPartitionPreservationSupported
            }
            onConfirm={handleFlash}
          />
        );
      case FlashBoardStep.Preparation:
        return <FlasherPreparation />;
      case FlashBoardStep.Flashing:
        return (
          flashEvent && (
            <FlasherFlashing
              flashEvent={flashEvent}
              succeeded={succeeded}
              onConfirm={close}
              onRetry={handleRetry}
              openArduinoSupport={openArduinoSupport}
            />
          )
        );
    }
  };

  return (
    <AppLabDialog
      open
      title={formatMessage(messages.title)}
      closeable={false}
      classes={{
        body: styles['dialog-body'],
        content: styles['dialog'],
        header: styles['dialog-header'],
      }}
    >
      <div className={styles['stepper-container']}>
        {steps.map((value) => (
          <div key={value} className={styles['step-item']}>
            <div className={styles['step-item-header']}>
              <div
                className={clsx(styles['step-indicator'], {
                  [styles['step-indicator--active']]: value === step,
                  [styles['step-indicator--completed']]: value < step,
                })}
              >
                {value < step ? (
                  <Checkmark />
                ) : (
                  <XSmall className={styles['step-indicator-counter']}>
                    {value}
                  </XSmall>
                )}
              </div>
              <XSmall className={styles['step-item-title']}>
                {getTitle(value)}
              </XSmall>
            </div>
            <div className={styles['step-item-content']}>
              <div
                className={clsx(styles['step-item-border'], {
                  [styles['visible']]: value !== steps[steps.length - 1],
                })}
              />
              {value === step && getContent(value)}
            </div>
          </div>
        ))}
      </div>
    </AppLabDialog>
  );
};
