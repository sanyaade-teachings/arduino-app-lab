import {
  AddLibrary,
  Bin,
  Library,
} from '@cloud-editor-mono/images/assets/icons';
import { XXSmall } from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import * as ContextMenu from '@radix-ui/react-context-menu';
import clsx from 'clsx';

import styles from './library-item.module.scss';

export interface LibraryItemProps {
  name: string;
  version: string;
  onDelete?: () => void;
  onAddLibrary?: () => void;
}

const LibraryItem: React.FC<LibraryItemProps> = (props: LibraryItemProps) => {
  const { name, version, onDelete, onAddLibrary } = props;

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger
        disabled={!onDelete}
        className={styles['library-item-context-menu-trigger']}
      >
        <div
          role="button"
          tabIndex={0}
          className={styles['library-item']}
          onFocus={(e): void => e.stopPropagation()}
        >
          <Library className={styles['library-item-icon']} />
          <div className={styles['library-item-text']}>
            <span>{name}</span>
            &nbsp;
            <span className={styles['library-item-text-version']}>
              {version}
            </span>
          </div>
        </div>
      </ContextMenu.Trigger>
      {onDelete && onAddLibrary && (
        <ContextMenu.Portal>
          <ContextMenu.Content className={styles['library-item-context-menu']}>
            <ContextMenu.Item
              className={clsx(
                styles['library-item-context-menu-item'],
                styles['is-delete'],
              )}
              onSelect={onDelete}
            >
              <Bin />
              <XXSmall>Remove</XXSmall>
            </ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item
              className={styles['library-item-context-menu-item']}
              onSelect={onAddLibrary}
            >
              <AddLibrary />
              <XXSmall>Add Sketch library</XXSmall>
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      )}
    </ContextMenu.Root>
  );
};

export default LibraryItem;
