import {
  Bin,
  Checkmark,
  ChevronDown,
  Download,
  OpenInNewTab,
  ThreeDots,
  Warning,
} from '@cloud-editor-mono/images/assets/icons';
import { AIModel, AIModelItem } from '@cloud-editor-mono/infrastructure';
import {
  Button,
  ButtonSize,
  ButtonType,
  DropdownMenuButton,
  DropdownMenuItemType,
  ProgressBar,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import clsx from 'clsx';
import { Key, useCallback, useEffect, useMemo, useState } from 'react';

import { useI18n } from '../../../i18n/useI18n';
import { XSmall, XXSmall } from '../../../typography';
import { aiModelMessages, messages } from '../../messages';
import styles from './ai-model.module.scss';
import { AppLabAiModelProps } from './AiModel.type';

export const AppLabAiModel: React.FC<AppLabAiModelProps> = (
  props: AppLabAiModelProps,
) => {
  const { formatMessage } = useI18n();
  const {
    inUseModelId,
    model,
    selectedModelId,
    onClick,
    downloadModel,
    modelDownloadInfo,
    openEdgeImpulse,
    removeModel,
    getInstalledModel,
    boardResourcesLogic,
  } = props;

  const { homeDiskUsedGB, homeDiskTotalGB } = boardResourcesLogic();
  const diskUsage = { used: homeDiskUsedGB, total: homeDiskTotalGB };

  const [selectedImpulse, setSelectedImpulse] = useState<
    Exclude<AIModel['impulses'], undefined>[number] | undefined
  >(model.impulses?.[0]);

  const [moreInfoIsOpen, setMoreInfoIsOpen] = useState(false);

  useEffect(() => {
    if (!selectedImpulse && model.impulses && model.impulses.length > 0) {
      setSelectedImpulse(model.impulses[0]);
    }
  }, [model.impulses, selectedImpulse]);

  const isDownloading = modelDownloadInfo && modelDownloadInfo.isDownloading;

  const showDiskWarning =
    diskUsage?.total &&
    diskUsage?.used &&
    parseFloat(diskUsage.total) - parseFloat(diskUsage.used) < 0.5; // 500MB

  const isModelInstalled = useCallback(
    (impulseId: string) =>
      getInstalledModel && !!getInstalledModel(model.id || '', impulseId),
    [getInstalledModel, model.id],
  );

  const currentInstalledModel = useMemo(
    () =>
      getInstalledModel &&
      getInstalledModel(model.id || '', selectedImpulse?.id),
    [getInstalledModel, model.id, selectedImpulse?.id],
  );

  // Show impulse name for installed orphan models
  const impulseName = useMemo(() => {
    return (
      getInstalledModel &&
      getInstalledModel(model.id || '')?.metadata?.['ei-impulse-name']
    );
  }, [getInstalledModel, model.id]);

  const [isInUse, impulseInUse] = useMemo(() => {
    const isEI = !!model.impulses;
    if (!isEI) {
      return [model.id === inUseModelId, undefined];
    }
    const ids = inUseModelId?.replace('ei-model-', '').split('-');
    const projectId = ids?.[0];
    const impulseId = ids?.[1];

    return [
      model.id === projectId,
      model.impulses?.find((i) => i.id === impulseId),
    ];
  }, [inUseModelId, model.id, model.impulses]);

  const hasMultipleImpulses =
    model && model.impulses && model.impulses.length > 1;

  return (
    <div
      className={clsx(styles['ai-model-card'], {
        [styles['selectable']]: !!onClick,
        [styles['selected']]: !!onClick && model.id === selectedModelId,
      })}
      {...(onClick && {
        onClick: (): void => onClick(model.id!),
      })}
    >
      {onClick && <div className={styles['radio']} />}
      <div className={styles['ai-model-card-container']}>
        <div className={styles['ai-model-card-header']}>
          <XSmall className={styles['ai-model-name']}>{model.name}</XSmall>
          {isInUse && (
            <div className={styles['ai-model-in-use']}>
              {formatMessage(messages.aiModelInUse)}
            </div>
          )}
          {((isInUse && impulseInUse) || impulseName) && (
            <div className={styles['ai-impulse-in-use']}>
              {impulseInUse?.name || impulseName}
            </div>
          )}
          {!currentInstalledModel?.is_builtin && (
            <DropdownMenuButton
              title={'Model options'}
              sections={[
                {
                  name: 'Actions',
                  items: [
                    {
                      id: 'edit-model',
                      label: 'Edit model',
                      labelPrefix: <OpenInNewTab />,
                    } as DropdownMenuItemType<string, string>,
                  ].concat(
                    currentInstalledModel
                      ? [
                          {
                            id: 'remove-model',
                            label: 'Uninstall',
                            labelPrefix: <Bin />,
                            itemClassName: styles['remove-model'],
                          },
                        ]
                      : [],
                  ),
                },
              ]}
              buttonChildren={<ThreeDots />}
              onAction={(key): void => {
                key === 'edit-model'
                  ? openEdgeImpulse?.(model.id || '', selectedImpulse?.id)
                  : removeModel?.(model.id || '', selectedImpulse?.id || '');
              }}
              classes={{
                dropdownMenuButtonWrapper:
                  styles['dropdown-menu-button-wrapper'],
                dropdownMenuButton: styles['dropdown-menu-button'],
                dropdownMenu: styles['dropdown-menu'],
                dropdownMenuItem: styles['dropdown-menu-item'],
              }}
            />
          )}
        </div>
        <XXSmall className={styles['ai-model-description']}>
          {model.description}
        </XXSmall>
        <details
          onToggle={async (e): Promise<void> => {
            setMoreInfoIsOpen(e.currentTarget.open);
          }}
          className={clsx(styles['more-info'], {
            [styles['is-open']]: moreInfoIsOpen,
          })}
        >
          <summary className={styles['more-info-summary']}>
            <XXSmall>
              {moreInfoIsOpen
                ? formatMessage(aiModelMessages.lessInfo)
                : formatMessage(aiModelMessages.moreInfo)}
            </XXSmall>
          </summary>
          <ul className={styles['more-info-list']}>
            <Button
              size={ButtonSize.XXSmall}
              type={ButtonType.Tertiary}
              onClick={(): void => {
                if (model.id && openEdgeImpulse) {
                  openEdgeImpulse(model.id, selectedImpulse?.id);
                }
              }}
              classes={{
                button: styles['button'],
              }}
            >
              {formatMessage(aiModelMessages.modelCard)}
            </Button>
            <XXSmall>
              {formatMessage(aiModelMessages.source, {
                source:
                  (model as AIModelItem)?.metadata?.['source'] ?? 'edgeimpulse',
              })}
            </XXSmall>
            <XXSmall>
              {formatMessage(aiModelMessages.eiProjectID, {
                id:
                  (model as AIModelItem)?.metadata?.['ei-project-id'] ??
                  model.id,
              })}
            </XXSmall>
          </ul>
        </details>
        {model.impulses && (
          <div className={styles['ai-model-impulse']}>
            {!isDownloading && (
              <>
                {showDiskWarning && (
                  <div className={styles['disk-warning']}>
                    <Warning />
                    Used: {diskUsage?.used} GB of {diskUsage?.total} GB
                  </div>
                )}
                {hasMultipleImpulses && (
                  <DropdownMenuButton
                    sections={[
                      {
                        name: 'Select Impulse',
                        items: (model.impulses || []).map((impulse) => ({
                          id: impulse.id,
                          label: impulse.name,
                          node: (
                            <div className={styles['impulse-item']}>
                              <div className={styles['impulse-item-name']}>
                                {impulse.name}
                              </div>
                              {isModelInstalled(impulse.id) && (
                                <span
                                  className={styles['impulse-item-installed']}
                                >
                                  Installed <Checkmark />
                                </span>
                              )}
                            </div>
                          ),
                        })),
                      },
                    ]}
                    classes={{
                      dropdownMenuButtonWrapper:
                        styles['dropdown-menu-button-wrapper'],
                      dropdownMenuButton: styles['dropdown-menu-button'],
                      dropdownMenu: styles['dropdown-menu'],
                      dropdownMenuItem: styles['dropdown-menu-item'],
                    }}
                    onAction={(key: Key): void => {
                      setSelectedImpulse(
                        model.impulses?.find((i) => i.id === key),
                      );
                    }}
                    buttonChildren={
                      <div className={styles['impulse-select']}>
                        <div className={styles['impulse-item']}>
                          <div className={styles['impulse-item-name']}>
                            {selectedImpulse?.name}
                          </div>
                          {selectedImpulse &&
                            isModelInstalled(selectedImpulse.id) && (
                              <span
                                className={styles['impulse-item-installed']}
                              >
                                Installed <Checkmark />
                              </span>
                            )}
                        </div>
                        <ChevronDown />
                      </div>
                    }
                  ></DropdownMenuButton>
                )}
                <Button
                  type={ButtonType.Primary}
                  size={ButtonSize.XSmall}
                  title="Download model"
                  onClick={(): void => {
                    model.id &&
                      selectedImpulse &&
                      downloadModel &&
                      downloadModel(model.id, selectedImpulse.id);
                  }}
                  classes={{
                    button: clsx(
                      styles['download-button'],
                      !hasMultipleImpulses && styles['download-button-text'],
                    ),
                  }}
                  disabled={
                    !selectedImpulse || isModelInstalled(selectedImpulse.id)
                  }
                >
                  {hasMultipleImpulses ? '' : 'Download'} <Download />
                </Button>
              </>
            )}
            {isDownloading && (
              <div className={styles['impulse-download-progress']}>
                <XXSmall>Installing model...</XXSmall>
                <ProgressBar
                  classes={{ progressBar: styles['progress-bar'] }}
                  active={true}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
