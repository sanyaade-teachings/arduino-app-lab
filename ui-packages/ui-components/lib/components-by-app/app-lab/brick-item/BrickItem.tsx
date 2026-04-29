import { AddBrick, Bin, Pencil } from '@cloud-editor-mono/images/assets/icons';
import * as ContextMenu from '@radix-ui/react-context-menu';
import clsx from 'clsx';

import { useTooltip } from '../../../tooltip';
import { XXSmall } from '../../../typography';
import { useI18n } from '../../shared';
import BrickIcon from '../brick-icon/BrickIcon';
import styles from './brick-item.module.scss';
import { BrickItemProps } from './BrickItem.type';
import { messages } from './messages';

const BrickItem: React.FC<BrickItemProps> = (props: BrickItemProps) => {
  const {
    brick,
    selected,
    onClick,
    onDelete,
    onRename,
    onAddBrick,
    missingConfig,
  } = props;

  const { formatMessage } = useI18n();

  const { props: tooltipProps, renderTooltip } = useTooltip({
    content: formatMessage(messages.missingConfigTooltip),
    timeout: 0,
  });

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger
        disabled={!onDelete}
        className={styles['brick-item-context-menu-trigger']}
      >
        <div
          role="button"
          tabIndex={0}
          className={clsx(styles['brick-item'], {
            [styles['brick-item-selected']]: selected,
            [styles['missing-config']]: missingConfig,
          })}
          onClick={onClick}
          onFocus={(e): void => e.stopPropagation()}
          onKeyDown={(e): void => {
            if (e.key === 'Enter') {
              onClick?.();
            }
          }}
        >
          <BrickIcon category={brick.category} size="xsmall" />
          <span {...tooltipProps} className={styles['brick-item-name']}>
            {brick.name}
          </span>
          {missingConfig ? renderTooltip(styles['brick-item-tooltip']) : null}
        </div>
      </ContextMenu.Trigger>
      {onDelete ? (
        <ContextMenu.Portal>
          <ContextMenu.Content className={styles['brick-item-context-menu']}>
            {onRename ? (
              <ContextMenu.Item
                className={styles['brick-item-context-menu-item']}
                onSelect={onRename}
              >
                <Pencil />
                <XXSmall>{formatMessage(messages.renameBrickLabel)}</XXSmall>
              </ContextMenu.Item>
            ) : null}
            <ContextMenu.Item
              className={clsx(styles['brick-item-context-menu-item'], {
                [styles['is-delete']]: true,
              })}
              onSelect={onDelete}
            >
              <Bin />
              <XXSmall>{formatMessage(messages.removeBrickLabel)}</XXSmall>
            </ContextMenu.Item>
            {onAddBrick ? (
              <>
                <ContextMenu.Separator />
                <ContextMenu.Item
                  className={styles['brick-item-context-menu-item']}
                  onSelect={onAddBrick}
                >
                  <AddBrick />
                  <XXSmall>{formatMessage(messages.addBrickLabel)}</XXSmall>
                </ContextMenu.Item>
              </>
            ) : null}
          </ContextMenu.Content>
        </ContextMenu.Portal>
      ) : null}
    </ContextMenu.Root>
  );
};

export default BrickItem;
