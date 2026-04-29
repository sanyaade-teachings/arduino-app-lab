import {
  AddBrick,
  AddLibrary,
  FileAdd as FileAddIcon,
  FolderAdd as FolderAddIcon,
} from '@cloud-editor-mono/images/assets/icons';
import * as ContextMenu from '@radix-ui/react-context-menu';

import styles from './file-tree.module.scss';
import { TreeNode } from './fileTree.type';

type TreeContextMenuProps = {
  onCreate: (type: TreeNode['type']) => () => void;
  onAddBrick: () => void;
  onAddSketchLibrary: () => void;
};

const TreeContextMenu: React.FC<TreeContextMenuProps> = ({
  onCreate,
  onAddBrick,
  onAddSketchLibrary,
}: TreeContextMenuProps) => {
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
          Create file
        </ContextMenu.Item>
        <ContextMenu.Item
          className={styles['tree-row-context-menu-item']}
          onSelect={onCreate('folder')}
        >
          <span className={styles['tree-row-context-icon-container']}>
            <FolderAddIcon />
          </span>
          Create new folder
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
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
};

export { TreeContextMenu };
