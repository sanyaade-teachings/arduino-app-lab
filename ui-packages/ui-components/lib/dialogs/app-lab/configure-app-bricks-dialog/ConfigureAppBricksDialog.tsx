import { OpenInNewTab } from '@cloud-editor-mono/images/assets/icons';
import {
  BrickConfigVariable,
  BrickCreateUpdateRequest,
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
import { configureAppBricksDialogMessages as messages } from '../messages';
import styles from './configure-app-bricks-dialog.module.scss';

export type ConfigureAppBricksDialogLogic = () => {
  bricks: BrickInstance[];
  open: boolean;
  confirmAction: (
    bricks: Record<string, BrickCreateUpdateRequest>,
  ) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  arduinoAuthAccountLogic: UseArduinoAccountLogic;
  edgeImpulseAuthAccountLogic: UseEdgeImpulseAccountLogic;
  openAndAssociateToDevice?: () => void;
  boardResourcesLogic: () => BoardResourcesValue;
};

type ConfigureAppBricksDialogProps = { logic: ConfigureAppBricksDialogLogic };

interface BrickVariable extends Omit<BrickConfigVariable, 'value'> {
  value: string;
}
type BricksParams = {
  brick: BrickInstance;
  modelId?: string;
  variables: BrickVariable[];
}[];

export const ConfigureAppBricksDialog: React.FC<
  ConfigureAppBricksDialogProps
> = ({ logic }: ConfigureAppBricksDialogProps) => {
  const {
    bricks,
    open,
    confirmAction,
    onOpenChange,
    arduinoAuthAccountLogic,
    edgeImpulseAuthAccountLogic,
    openAndAssociateToDevice,
    boardResourcesLogic,
  } = logic();
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<BricksParams>([]);
  const [showTrainModel, setShowTrainModel] = useState(false);

  const { user: arduinoUser } = arduinoAuthAccountLogic();

  const { user: edgeImpulseUser } = edgeImpulseAuthAccountLogic();

  const { formatMessage } = useI18n();

  useEffect(() => {
    if (!open) return;

    setParams(
      bricks.reduce<BricksParams>((acc, brick) => {
        if (
          !brick.id ||
          ((brick.compatible_models ?? []).length === 0 &&
            (brick.config_variables ?? []).length === 0)
        ) {
          return acc;
        }

        return [
          ...acc,
          {
            brick,
            modelId: brick.model,
            variables:
              brick.config_variables?.map((config) => ({
                ...config,
                value: config.value ?? '',
              })) ?? [],
          },
        ];
      }, []),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bricks, open]);

  const handleConfirm = async (): Promise<void> => {
    const variables = params.reduce(
      (acc, { brick, modelId, variables }) => ({
        ...acc,
        [brick.id!]: {
          model: modelId,
          variables: variables.reduce(
            (acc, variable) => ({
              ...acc,
              [variable.name!]: variable.value,
            }),
            {},
          ),
        },
      }),
      {},
    );
    setLoading(true);
    const success = await confirmAction(variables);
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
            disabled={params.some(
              ({ brick, modelId, variables }) =>
                (brick.require_model && !modelId) ||
                variables.some(
                  (variable) =>
                    variable.required && !variable.value.trim().length,
                ),
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
        {params.map(({ brick, modelId, variables }) => (
          <div key={brick.id} className={styles['brick-container']}>
            <XSmall className={styles['brick-name']}>
              {formatMessage(messages.dialogBodyTitle, {
                brickName: brick.name,
              })}
            </XSmall>
            {variables.map((variable) => (
              <div key={variable.name} className={styles['param-row']}>
                <Input
                  inputStyle={InputStyle.AppLab}
                  type="text"
                  value={variable.value}
                  onChange={(value: string): void =>
                    setParams((prev) =>
                      prev.map((it) =>
                        it.brick.id === brick.id
                          ? {
                              ...it,
                              variables: it.variables.map((v) =>
                                v.name === variable.name ? { ...v, value } : v,
                              ),
                            }
                          : it,
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
            {(brick.compatible_models ?? []).length > 0 && (
              <>
                <XSmall className={styles['brick-subtitle']}>
                  {formatMessage(messages.dialogBodySubtitle)}
                </XSmall>
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
                >
                  {formatMessage(messages.trainNewModelButton)}
                </Button>
                {brick?.compatible_models?.map((model) => (
                  <AppLabAiModel
                    key={model.id}
                    inUseModelId={brick.model}
                    model={model}
                    selectedModelId={modelId}
                    boardResourcesLogic={boardResourcesLogic}
                    onClick={(modelId: string): void =>
                      setParams((prev) =>
                        prev.map((it) =>
                          it.brick.id === brick.id
                            ? {
                                ...it,
                                modelId,
                              }
                            : it,
                        ),
                      )
                    }
                  />
                ))}
              </>
            )}
          </div>
        ))}
        <XXXSmall className={styles['brick-description']}>
          {formatMessage(messages.dialogBodyDescription)}
        </XXXSmall>
      </div>
    </AppLabDialog>
  );
};
