import {
  AddBrick,
  AddLibrary,
  FileAdd as FileAddIcon,
  FolderAdd as FolderAddIcon,
  UploadFolder,
  UploadLight,
} from '@cloud-editor-mono/images/assets/icons';
import * as ContextMenu from '@radix-ui/react-context-menu';

import { useI18n } from '../i18n/useI18n';
import styles from './file-tree.module.scss';
import { TreeNode } from './fileTree.type';
import { messages } from './messages';

type TreeContextMenuProps = {
  onCreate: (type: TreeNode['type']) => () => void;
  onAddBrick: () => void;
  onAddSketchLibrary: () => void;
  onResourceImport: (params: { path?: string; isFolder?: boolean }) => void;
};

const TreeContextMenu: React.FC<TreeContextMenuProps> = ({
  onCreate,
  onAddBrick,
  onAddSketchLibrary,
  onResourceImport,
}: TreeContextMenuProps) => {
  const { formatMessage } = useI18n();

  return (
    <ContextMenu.Portal>
      <ContextMenu.Content className={styles['tree-row-context-menu']}>
        <ContextMenu.Item
          className={styles['tree-row-context-menu-item']}
          onSelect={onCreate('file')}
        >
          <span className={styles['tree-row-context-icon-container']}>
            <FileAddIcon />
          </span>
          {formatMessage(messages.createFile)}
        </ContextMenu.Item>
        <ContextMenu.Item
          className={styles['tree-row-context-menu-item']}
          onSelect={onCreate('folder')}
        >
          <span className={styles['tree-row-context-icon-container']}>
            <FolderAddIcon />
          </span>
          {formatMessage(messages.createFolder)}
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item
          className={styles['tree-row-context-menu-item']}
          onSelect={onAddBrick}
        >
          <span className={styles['tree-row-context-icon-container']}>
            <AddBrick />
          </span>
          Add Brick
        </ContextMenu.Item>
        <ContextMenu.Item
          className={styles['tree-row-context-menu-item']}
          onSelect={onAddSketchLibrary}
        >
          <span className={styles['tree-row-context-icon-container']}>
            <AddLibrary />
          </span>
          Add Sketch library
        </ContextMenu.Item>
        <ContextMenu.Item
          className={styles['tree-row-context-menu-item']}
          onSelect={(): void => onResourceImport({})}
        >
          <span className={styles['tree-row-context-icon-container']}>
            <UploadLight />
          </span>
          {formatMessage(messages.importFile)}
        </ContextMenu.Item>
        <ContextMenu.Item
          className={styles['tree-row-context-menu-item']}
          onSelect={(): void => onResourceImport({ isFolder: true })}
        >
          <span className={styles['tree-row-context-icon-container']}>
            <UploadFolder />
          </span>
          {formatMessage(messages.importFolder)}
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
};

export { TreeContextMenu };
