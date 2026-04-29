import * as ContextMenu from '@radix-ui/react-context-menu';
import clsx from 'clsx';
import { useCallback } from 'react';
import { RowRendererProps } from 'react-arborist';

import styles from './file-tree.module.scss';
import { FileContextMenu } from './FileContextMenu';
import { TreeNode } from './fileTree.type';
import { mustHideContextMenu } from './utils';

type FileRowProps = RowRendererProps<TreeNode> & {
  selectedNode: TreeNode | undefined;
  selectedFolder: TreeNode | undefined;
  dragOverZone: 'root' | string | null;
  onDragOverChange: (zone: 'root' | string | null) => void;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
  onCreate: (type: TreeNode['type'], path: string) => void;
  isProjectReadOnly: boolean;
  isBricksSelected?: boolean;
  onDragStart?: () => void;
};

const FileRow: React.FC<FileRowProps> = ({
  selectedNode,
  selectedFolder,
  dragOverZone,
  onDragOverChange,
  onSelect,
  onRename,
  onDelete,
  isProjectReadOnly,
  onCreate,
  isBricksSelected = false,
  onDragStart,
  ...rowProps
}: FileRowProps) => {
  const { node } = rowProps;

  const openFolderAndCreate = (type: TreeNode['type'], path: string) => () => {
    node.open();
    onCreate(type, path);
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDragOverChange(node.data.path);
    },
    [node, onDragOverChange],
  );

  return (
    <div
      {...rowProps.attrs}
      className={clsx(styles['tree-row-container'], {
        [styles['tree-row-container--drag-over']]:
          dragOverZone === node.data.path,
      })}
      onDragStart={onDragStart}
      onDragOver={handleDragOver}
    >
      <ContextMenu.Root>
        <ContextMenu.Trigger
          onContextMenu={(e): false | void =>
            mustHideContextMenu(isProjectReadOnly, node.data) &&
            e.preventDefault()
          } // disable native context menu
          disabled={mustHideContextMenu(isProjectReadOnly, node.data)}
          className={styles['tree-row-context-menu-trigger']}
        >
          <div
            role="button"
            tabIndex={0}
            className={clsx(styles['tree-row'], {
              [styles['tree-row-selected']]:
                // Give priority to folder selection over file selection
                // This ensures only one element appears selected at a time
                (selectedFolder && node.data.path === selectedFolder.path) ||
                (selectedNode &&
                  !selectedFolder &&
                  node.data.path === selectedNode.path &&
                  !isBricksSelected),
            })}
            ref={rowProps.innerRef}
            onFocus={(e): void => e.stopPropagation()}
            onKeyDown={(e): void => {
              if (e.key === 'Enter') {
                onSelect();
              }
            }}
            onClick={(): void => onSelect()}
          >
            {rowProps.children}
          </div>
        </ContextMenu.Trigger>
        <FileContextMenu
          node={node.data}
          onRename={onRename}
          onDelete={onDelete}
          onCreate={openFolderAndCreate}
        />
      </ContextMenu.Root>
    </div>
  );
};

export default FileRow;
