import {
  FlashEvent,
  OSImageRelease,
} from '@cloud-editor-mono/domain/src/services/flasher-service';
import {
  AppLabInfo,
  CaretDown,
  TriangleSharp,
} from '@cloud-editor-mono/images/assets/icons';
import {
  Button,
  ButtonType,
  Checkbox,
  DropdownMenuButton,
  Input,
  InputStyle,
  Skeleton,
  useI18n,
  useTooltip,
  XXSmall,
  XXXSmall,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import clsx from 'clsx';
import { Key, useEffect, useRef, useState } from 'react';

import styles from '../../flasher.module.scss';
import { messages } from '../../messages';
import stepStyles from './flasher-configuration.module.scss';

interface FlasherConfigurationProps {
  flashEvent: FlashEvent | null;
  loading: boolean;
  listAvailableImages: () => Promise<OSImageRelease[]>;
  getAvailableFreeSpace: () => Promise<number>;
  getUserPartitionPreservationSupported: (id: string) => Promise<boolean>;
  onConfirm: (imageVersion: OSImageRelease, preserveData: boolean) => void;
}

const REQUIRED_FREE_SPACE_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB

export const FlasherConfiguration: React.FC<FlasherConfigurationProps> = ({
  flashEvent,
  loading,
  listAvailableImages,
  getAvailableFreeSpace,
  getUserPartitionPreservationSupported,
  onConfirm,
}: FlasherConfigurationProps) => {
  const { formatMessage } = useI18n();
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [imageVersions, setImageVersions] = useState<OSImageRelease[]>([]);
  const [imageVersion, setImageVersion] = useState<OSImageRelease>();
  const [preserve, setPreserve] = useState(true);
  const [preserveSupported, setPreserveSupported] = useState(true);
  const [hasEnoughSpace, setHasEnoughSpace] = useState(true);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadResources = async (): Promise<void> => {
      try {
        const [availableImages, freeSpace] = await Promise.all([
          listAvailableImages(),
          getAvailableFreeSpace(),
        ]);
        setImageVersions(availableImages);
        const latest = availableImages.find((v) => v.latest);
        setImageVersion(latest);
        setHasEnoughSpace(freeSpace > REQUIRED_FREE_SPACE_BYTES);
      } catch {
        setImageVersions([]);
        setImageVersion(undefined);
      }
    };

    if (!loading) {
      loadResources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    const checkPreserveSupported = async (): Promise<void> => {
      if (!imageVersion?.version_label) return;
      try {
        const isPreserveSupported = await getUserPartitionPreservationSupported(
          imageVersion.version_label,
        );
        setPreserveSupported(isPreserveSupported);
        setPreserve(isPreserveSupported);
      } catch {
        setPreserveSupported(false);
        setPreserve(false);
      }
    };
    checkPreserveSupported();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageVersion]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent): void {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [open]);

  const { props: tooltipProps, renderTooltip } = useTooltip({
    content: formatMessage(messages.configurationStepPreserveDataTooltip, {
      bold: (text: string) => <b>{text}</b>,
    }),
  });

  const handleConfirm = (): void => {
    if (imageVersion) {
      onConfirm(imageVersion, preserve);
    }
  };

  const progress = flashEvent?.total
    ? Math.floor(((flashEvent?.progress ?? 0) / flashEvent.total) * 100)
    : 0;

  return (
    <div className={styles['step-container']}>
      <div className={styles['step-card']}>
        {loading ? (
          <>
            <div className={stepStyles['skeleton-container']}>
              <div className={stepStyles['skeleton']}>
                <Skeleton variant="rounded" count={1} />
              </div>
              <div
                className={clsx(
                  stepStyles['skeleton-container'],
                  stepStyles['skeleton-container--horizontal'],
                )}
              >
                <div
                  className={clsx(
                    stepStyles['skeleton'],
                    stepStyles['skeleton--small'],
                  )}
                >
                  <Skeleton variant="rounded" count={1} />
                </div>
                <div className={stepStyles['skeleton-button']} />
              </div>
            </div>
            <div className={stepStyles['skeleton-container']}>
              <div className={stepStyles['skeleton']}>
                <Skeleton variant="rounded" count={1} />
              </div>
              <div
                className={clsx(
                  stepStyles['skeleton'],
                  stepStyles['skeleton--medium'],
                )}
              >
                <Skeleton variant="rounded" count={1} />
              </div>
            </div>
          </>
        ) : flashEvent === null ? (
          <>
            <div className={stepStyles['image-version-container']}>
              <div
                ref={inputRef}
                role="button"
                tabIndex={0}
                className={clsx(stepStyles['image-version'], {
                  [stepStyles['disabled']]: disabled,
                  [stepStyles['open']]: open,
                })}
                onClick={(): void => setOpen((prev) => !prev)}
                onKeyUp={(): void => setOpen((prev) => !prev)}
              >
                <Input
                  inputStyle={InputStyle.AppLab}
                  id="image-version"
                  type="text"
                  readOnly
                  name="image-version"
                  value={
                    imageVersion
                      ? [
                          imageVersion.version_label,
                          imageVersion.latest ? ' (Latest)' : '',
                        ].join('')
                      : ''
                  }
                  onClick={(): void => setOpen((prev) => !prev)}
                  onChange={(key: Key): void =>
                    setImageVersion(imageVersions.find((v) => v.id === key))
                  }
                  label={formatMessage(
                    messages.configurationStepImageVersionLabel,
                  )}
                  classes={{
                    input: stepStyles['input'],
                    inputLabel: stepStyles['input-label'],
                  }}
                />
                {!disabled && (
                  <DropdownMenuButton
                    isOpen={open}
                    sections={[
                      {
                        name: 'Image Versions',
                        items: imageVersions.map((version) => ({
                          id: version.id || '',
                          label: [
                            version.version_label,
                            version.latest ? ' (Latest)' : '',
                          ].join(''),
                        })),
                      },
                    ]}
                    classes={{
                      dropdownMenu: stepStyles['dropdown-menu'],
                      dropdownMenuButton: stepStyles['dropdown-menu-button'],
                      dropdownMenuButtonWrapper:
                        stepStyles['dropdown-menu-button-wrapper'],
                    }}
                    onAction={(key: Key): void =>
                      setImageVersion(imageVersions.find((v) => v.id === key))
                    }
                    buttonChildren={
                      <CaretDown
                        className={clsx(stepStyles['dropdown-menu-icon'], {
                          [stepStyles['dropdown-menu-icon--open']]: open,
                        })}
                        onClick={(): void => setOpen((prev) => !prev)}
                      />
                    }
                  />
                )}
              </div>
              {disabled && (
                <button
                  className={stepStyles['input-button']}
                  onClick={(): void => setDisabled(false)}
                >
                  <XXSmall className={stepStyles['input-button-label']}>
                    {formatMessage(
                      messages.configurationStepImageVersionAction,
                    )}
                  </XXSmall>
                </button>
              )}
            </div>
            {preserveSupported ? (
              <div className={stepStyles['preserve-data-container']}>
                <XXXSmall className={stepStyles['preserve-data-label']}>
                  {formatMessage(messages.configurationStepPreserveDataTitle)}
                </XXXSmall>
                <div className={stepStyles['preserve-data']}>
                  <Checkbox
                    isSelected={preserve}
                    onChange={(value): void => setPreserve(value)}
                    classes={{
                      input: stepStyles['preserve-data-input'],
                      inputChecked: stepStyles['preserve-data-input--checked'],
                    }}
                  >
                    {formatMessage(messages.configurationStepPreserveDataLabel)}
                  </Checkbox>
                  <div {...tooltipProps}>
                    <div className={stepStyles['info-icon']}>
                      <AppLabInfo />
                    </div>
                    {renderTooltip(stepStyles['tooltip-content'])}
                  </div>
                </div>
              </div>
            ) : (
              <div className={stepStyles['preserve-data-warning']}>
                <TriangleSharp />
                <XXSmall>
                  {formatMessage(
                    messages.configurationStepPreserveDataWarning,
                    {
                      bold: (text: string) => <b>{text}</b>,
                    },
                  )}
                </XXSmall>
              </div>
            )}
          </>
        ) : (
          <div className={stepStyles['flash-event-container']}>
            <XXSmall className={stepStyles['flash-event-title']}>
              {[
                formatMessage(messages.configurationStepImageVersionLabel),
                imageVersion?.version_label,
                imageVersion?.latest ? '(Latest)' : null,
              ]
                .filter((it) => !!it)
                .join(' ')}
            </XXSmall>
            <XXXSmall className={stepStyles['flash-event-subtitle']}>
              {flashEvent.step === 'downloading'
                ? formatMessage(messages.flashingStepDownloadingLabel, {
                    progress,
                  })
                : formatMessage(messages.flashingStepExtractingLabel)}
            </XXXSmall>
            {flashEvent.step === 'downloading' ? (
              <div className={styles['progress-bar']}>
                <div
                  className={clsx(styles['progress'], styles[`p${progress}`])}
                />
              </div>
            ) : (
              <div className={styles['waiting-indicator']}>
                <div className={styles['indicator']} />
              </div>
            )}
          </div>
        )}
      </div>
      {flashEvent === null && (
        <div className={stepStyles['step-footer']}>
          {loading ? (
            <div className={stepStyles['skeleton-button']} />
          ) : (
            <>
              {hasEnoughSpace ? (
                <XXSmall>
                  {formatMessage(messages.configurationStepActionInfo)}
                </XXSmall>
              ) : (
                <div className={stepStyles['warning']}>
                  <TriangleSharp />
                  <XXSmall>
                    {formatMessage(messages.configurationStepActionWarning)}
                  </XXSmall>
                </div>
              )}
              <Button
                disabled={!hasEnoughSpace || flashEvent !== null}
                loading={flashEvent !== null}
                type={ButtonType.Primary}
                onClick={handleConfirm}
                classes={{
                  textButtonText: stepStyles['flash-button'],
                }}
              >
                {formatMessage(messages.configurationStepAction)}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
