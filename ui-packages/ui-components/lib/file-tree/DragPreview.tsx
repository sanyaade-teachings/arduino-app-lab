import React, { useCallback } from 'react';

import styles from './dragPreview.module.scss';
import { TreeNode } from './fileTree.type';

interface DragPreviewProps {
  offset: { x: number; y: number } | null;
  mouse: { x: number; y: number } | null;
  dragIds: string[];
  isDragging: boolean;
  data: TreeNode[] | undefined;
  renderNodeIcon: (node: TreeNode) => React.ReactNode;
}

const findNodeById = (
  nodes: TreeNode[] | undefined,
  id: string,
): TreeNode | null => {
  if (!nodes) return null;

  for (const node of nodes) {
    if (node.path === id) {
      return node;
    }
    if (node.type === 'folder' && node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const DragPreview: React.FC<DragPreviewProps> = ({
  offset,
  mouse,
  dragIds,
  isDragging,
  data,
  renderNodeIcon,
}) => {
  const getStyle = useCallback((offset: { x: number; y: number } | null) => {
    if (!offset) return { display: 'none' };
    const { x, y } = offset;
    return { transform: `translate(${x}px, ${y}px)` };
  }, []);

  const layerStyles = {
    position: 'fixed' as const,
    pointerEvents: 'none' as const,
    zIndex: 100,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  };

  if (!isDragging) return <div></div>;

  // Find the dragged node
  const draggedNode =
    dragIds.length > 0 ? findNodeById(data, dragIds[0]) : null;

  return (
    <div style={layerStyles}>
      <div className="row preview" style={getStyle(offset)}>
        <div className={styles.dragPreviewChip}>
          <span className={styles.dragPreviewIcon}>
            {draggedNode ? renderNodeIcon(draggedNode) : null}
          </span>
          <span>{draggedNode?.name}</span>
        </div>
      </div>
      {dragIds.length > 1 && (
        <div
          className={styles.dragPreviewCount}
          style={{
            position: 'absolute',
            transform: `translate(${(mouse?.x ?? 0) + 10}px, ${
              (mouse?.y ?? 0) + 10
            }px)`,
          }}
        >
          {dragIds.length}
        </div>
      )}
    </div>
  );
};
