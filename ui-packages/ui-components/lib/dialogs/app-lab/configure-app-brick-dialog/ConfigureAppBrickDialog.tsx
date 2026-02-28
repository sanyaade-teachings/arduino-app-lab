import { OpenInNewTab } from '@cloud-editor-mono/images/assets/icons';
import {
  AIModelItem,
  BrickConfigVariable,
  BrickCreateUpdateRequest,
  BrickDetails,
  BrickInstance,
} from '@cloud-editor-mono/infrastructure';
import { capitalize } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

import { AppLabAiModel } from '../../../app-lab-brick-detail/sub-components/ai-model/AiModel';
import {
  BoardResourcesValue,
  Button,
  ButtonSize,
  ButtonType,
  TrainNewModelDialog,
  UseArduinoAccountLogic,
  UseEdgeImpulseAccountLogic,
} from '../../../components-by-app/app-lab';
import { Input } from '../../../essential/input';
import { InputStyle } from '../../../essential/input/input.type';
import { useI18n } from '../../../i18n/useI18n';
import { XSmall, XXSmall, XXXSmall } from '../../../typography';
import { AppLabDialog } from '../app-lab-dialog/AppLabDialog';
import { configureAppBrickDialogMessages as messages } from '../messages';
import styles from './configure-app-brick-dialog.module.scss';

export type ConfigureAppBrickDialogLogic = () => {
  brick: BrickDetails;
  open: boolean;
  loadBrickInstance: (id: string) => Promise<BrickInstance>;
  getInstalledModel?: (id: string) => AIModelItem | undefined;
  confirmAction: (
    brickId: string,
    params: BrickCreateUpdateRequest,
  ) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  arduinoAuthAccountLogic: UseArduinoAccountLogic;
  edgeImpulseAuthAccountLogic: UseEdgeImpulseAccountLogic;
  openAndAssociateToDevice?: () => void;
  boardResourcesLogic: () => BoardResourcesValue;
};

type ConfigureAppBrickDialogProps = { logic: ConfigureAppBrickDialogLogic };

interface BrickVariable extends Omit<BrickConfigVariable, 'value'> {
  value: string;
}

export const ConfigureAppBrickDialog: React.FC<
  ConfigureAppBrickDialogProps
> = ({ logic }: ConfigureAppBrickDialogProps) => {
  const {
    brick,
    open,
    loadBrickInstance,
    confirmAction,
    onOpenChange,
    getInstalledModel,
    arduinoAuthAccountLogic,
    edgeImpulseAuthAccountLogic,
    openAndAssociateToDevice,
    boardResourcesLogic,
  } = logic();
  const [loading, setLoading] = useState(false);
  const [instance, setInstance] = useState<BrickInstance>();
  const [variables, setVariables] = useState<BrickVariable[]>([]);
  const [modelId, setModelId] = useState<string>();
  const [showTrainModel, setShowTrainModel] = useState(false);

  const { user: arduinoUser } = arduinoAuthAccountLogic();

  const { user: edgeImpulseUser } = edgeImpulseAuthAccountLogic();

  const { formatMessage } = useI18n();

  useEffect(() => {
    if (!open) return;

    const loadInstance = async (): Promise<void> => {
      if (!brick.id) return;
      try {
        const instance = await loadBrickInstance(brick.id);
        setInstance(instance);
        setVariables(
          (instance.config_variables ?? []).map((config) => ({
            ...config,
            value: config.value ?? '',
          })),
        );
        setModelId(instance.model);
      } catch {
        setInstance(undefined);
        setVariables([]);
        setModelId(undefined);
      }
    };
    loadInstance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brick, open]);

  const handleConfirm = async (): Promise<void> => {
    if (!brick.id) return;
    setLoading(true);

    const success = await confirmAction(brick.id, {
      model: modelId,
      variables: variables.reduce(
        (acc, variable) => ({
          ...acc,
          [variable.name!]: variable.value,
        }),
        {},
      ),
    });
    setLoading(false);
    if (success) {
      onOpenChange(false);
    }
  };

  const onOpenTrainNewModelDialogChange = useCallback((value: boolean) => {
    setShowTrainModel(value);
  }, []);

  return (
    <AppLabDialog
      open={open}
      onOpenChange={onOpenChange}
      title={formatMessage(messages.dialogTitle)}
      footer={
        <>
          <Button
            type={ButtonType.Secondary}
            onClick={(): void => onOpenChange(false)}
            uppercase={false}
            classes={{
              button: styles['action-button'],
              textButtonText: styles['action-button-text'],
            }}
          >
            {formatMessage(messages.cancelButton)}
          </Button>
          <Button
            type={ButtonType.Primary}
            uppercase={false}
            loading={loading}
            onClick={handleConfirm}
            disabled={variables.some(
              (variable) => variable.required && !variable.value.trim().length,
            )}
            classes={{
              button: styles['action-button'],
              textButtonText: styles['action-button-text'],
            }}
          >
            {formatMessage(messages.confirmButton)}
          </Button>
        </>
      }
      classes={{
        root: styles['root'],
        content: styles['content'],
        body: styles['body'],
      }}
    >
      <div className={styles['container']}>
        <TrainNewModelDialog
          arduinoAuthAccountLogic={arduinoAuthAccountLogic}
          edgeImpulseAuthAccountLogic={edgeImpulseAuthAccountLogic}
          open={showTrainModel}
          onOpenChange={onOpenTrainNewModelDialogChange}
          openAndAssociateToDevice={openAndAssociateToDevice}
        />
        {variables.map((variable) => (
          <div key={variable.name} className={styles['param-row']}>
            <Input
              inputStyle={InputStyle.AppLab}
              type="text"
              value={variable.value}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
              onChange={(value: string): void =>
                setVariables((prev) =>
                  prev.map((v) =>
                    v.name === variable.name ? { ...v, value } : v,
                  ),
                )
              }
              label={variable.name?.split('_').map(capitalize).join(' ')}
              required={variable.required}
              classes={{
                input: styles['input'],
              }}
            />
            <XXSmall>{variable.description}</XXSmall>
          </div>
        ))}
        {variables.length !== 0 && (
          <XXXSmall className={styles['brick-description']}>
            {formatMessage(messages.dialogBodyDescription)}
          </XXXSmall>
        )}
        {brick.compatible_models && brick.compatible_models.length > 0 && (
          <>
            <XSmall className={styles['brick-subtitle']}>
              {formatMessage(messages.dialogBodySubtitle)}
              <Button
                type={ButtonType.Tertiary}
                size={ButtonSize.XSmall}
                onClick={(): void => {
                  if (
                    !!edgeImpulseUser &&
                    !!arduinoUser &&
                    openAndAssociateToDevice
                  ) {
                    openAndAssociateToDevice();
                    return;
                  }

                  setShowTrainModel(true);
                }}
                Icon={OpenInNewTab}
                classes={{
                  button: styles['train-new-model-button'],
                }}
              >
                {formatMessage(messages.trainNewModelButton)}
              </Button>
            </XSmall>
            {brick.compatible_models.map((model) => (
              <AppLabAiModel
                key={model.id}
                inUseModelId={instance?.model}
                model={model}
                selectedModelId={modelId}
                onClick={setModelId}
                getInstalledModel={getInstalledModel}
                boardResourcesLogic={boardResourcesLogic}
              />
            ))}
          </>
        )}
      </div>
    </AppLabDialog>
  );
};
