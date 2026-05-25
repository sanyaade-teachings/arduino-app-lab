import * as ContextMenu from '@radix-ui/react-context-menu';
import clsx from 'clsx';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  NodeApi,
  NodeRendererProps,
  RowRendererProps,
  Tree,
  TreeApi,
} from 'react-arborist';

import {
  DuplicateFileDialogLogic,
  OnDuplicateConflictParams,
} from '../dialogs/app-lab/duplicate-file-dialog/types';
import { Skeleton } from '../skeleton';
import { DragPreview } from './DragPreview';
import styles from './file-tree.module.scss';
import FileNode from './FileNode';
import FileRow from './FileRow';
import { FileTreeApi, TreeNode } from './fileTree.type';
import { TreeContextMenu } from './TreeContextMenu';
import { checkForDuplicates } from './utils';
import { canBeDragged, insertNewNode, isFileNode } from './utils';

const TEMP_CREATED_NODE_NAME = '__CREATE__';

interface FileTreeProps {
  height: number | undefined;
  nodes: TreeNode[] | undefined;
  selectedNode: TreeNode | undefined;
  selectedFolder?: TreeNode | undefined;
  isReadOnly?: boolean;
  defaultOpenFoldersState?: { [key: string]: boolean };
  selectedFileChange: (node: TreeNode) => void;
  onFolderSelect: (node: TreeNode | undefined) => void; // New prop for folder selection
  renderNodeIcon: (node: TreeNode) => JSX.Element;
  onFileCreate: (path: string) => Promise<void>;
  onFileRename: (
    path: string,
    newName: string,
    nodeType?: TreeNode['type'],
  ) => Promise<void>;
  onFileDelete: (path: string, nodeType?: TreeNode['type']) => Promise<void>;
  onFileMove: (
    fromPath: string,
    toPath: string,
    filesToUpdate?: Array<{ oldPath: string; newPath: string }>,
  ) => Promise<void>;
  onFolderCreate: (path: string) => Promise<void>;
  onResourceImport: (params: { path?: string; isFolder?: boolean }) => void;
  isBricksSelected: boolean;
  openFiles?: { fileId: string }[];
  updateOpenFile?: (currFileId: string, nextFileId: string) => void;
  onDuplicateConflict?: (params: OnDuplicateConflictParams) => void;
  duplicateFileDialogLogic?: DuplicateFileDialogLogic;
  onAddBrick: () => void;
  onAddSketchLibrary: () => void;
}

const FileTree = forwardRef<FileTreeApi, FileTreeProps>((props, ref) => {
  const {
    height = 500,
    nodes,
    selectedNode,
    selectedFolder,
    isReadOnly = false,
    selectedFileChange,
    onFolderSelect,
    onFileCreate,
    onFileRename,
    onFileDelete,
    onFileMove,
    onFolderCreate,
    onResourceImport,
    defaultOpenFoldersState,
    isBricksSelected,
    renderNodeIcon,
    openFiles,
    updateOpenFile,
    onDuplicateConflict,
    onAddBrick,
    onAddSketchLibrary,
  } = props;

  const treeApiRef = useRef<TreeApi<TreeNode>>(null);

  const [isCreating, setIsCreating] = useState<{
    path: string;
    type: TreeNode['type'];
  } | null>(null);
  const [isEditingAt, setIsEditingAt] = useState<string | null>(null);
  const [dragOverZone, setDragOverZone] = useState<'root' | string | null>(
    null,
  );
  const dragOverZoneRef = useRef<'root' | string | null>(null);
  const draggingNodeRef = useRef<NodeApi<TreeNode> | null>(null);

  const handleDragOverZoneChange = useCallback(
    (zone: 'root' | string | null): void => {
      dragOverZoneRef.current = zone;
      setDragOverZone(zone);
    },
    [],
  );

  const scrollToNode = (nodeId: string): void => {
    treeApiRef.current!.scrollTo(nodeId, 'smart');
  };

  useEffect(() => {
    const handleDragEnd = (): void => {
      handleDragOverZoneChange(null);
      dragOverZoneRef.current = null;
      draggingNodeRef.current = null;
    };

    document.addEventListener('dragend', handleDragEnd);
    return (): void => {
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  // automatically scroll to selected node and open parent folders when node is auto-selected
  useEffect(() => {
    if (!treeApiRef.current || !selectedNode) {
      return;
    }

    treeApiRef.current.openParents(selectedNode.path);

    setTimeout(() => {
      scrollToNode(selectedNode.path);
    }, 100);
  }, [selectedNode]);

  const data = useMemo(() => {
    return nodes && isCreating !== null
      ? insertNewNode(
          nodes,
          isCreating.path,
          isCreating.type,
          TEMP_CREATED_NODE_NAME,
        )
      : nodes;
  }, [isCreating, nodes]);

  const handleNodeSelect = (node: NodeApi<TreeNode>): void => {
    if (node.isLeaf) {
      // File selection - folder clearing is handled by parent setSelectedFile logic
      selectedFileChange(node.data);
    } else if (node.isInternal) {
      // Folder selection should not interfere with file selection
      // This fixes the bug where clicking a folder would cause file selection conflicts
      onFolderSelect(node.data);
      node.toggle();
    }
  };

  const handleNodeCreation = useCallback(
    (
      nodeType: TreeNode['type'],
      isReadOnly: boolean,
      path?: string,
      selectedNode?: TreeNode,
      selectedFolder?: TreeNode,
    ): void => {
      if (isReadOnly) {
        console.warn('File tree is read-only. Cannot create new folders.');
        return;
      }

      let createAtPath = path || '';

      if (path === undefined) {
        const treeApi = treeApiRef.current;
        // Use selectedFolder for file creation when present, otherwise use selectedNode
        // This ensures files are created in the right location without affecting open files
        if (selectedFolder && treeApi?.get(selectedFolder.path)) {
          createAtPath = selectedFolder.path;
        } else if (selectedNode && treeApi?.get(selectedNode.path)) {
          createAtPath = selectedNode.path;
          if (isFileNode(selectedNode)) {
            // If a file is selected, get its parent folder path
            const parts = selectedNode.path.split('/');
            parts.pop();
            createAtPath = parts.join('/');
          }
        }
      }

      setIsCreating({
        path: createAtPath,
        type: nodeType,
      });

      scrollToNode(`${createAtPath}/${TEMP_CREATED_NODE_NAME}`);
      if (treeApiRef.current && createAtPath) {
        treeApiRef.current.openParents(createAtPath);
      }
    },
    [],
  );

  const handleFileCreate = useCallback(
    (path?: string): void =>
      handleNodeCreation(
        'file',
        isReadOnly,
        path,
        selectedNode,
        selectedFolder,
      ),
    [handleNodeCreation, isReadOnly, selectedNode, selectedFolder],
  );

  const handleFolderCreate = useCallback(
    (path?: string): void =>
      handleNodeCreation(
        'folder',
        isReadOnly,
        path,
        selectedNode,
        selectedFolder,
      ),
    [handleNodeCreation, isReadOnly, selectedNode, selectedFolder],
  );

  const handleDrop = useCallback(
    (args: {
      dragNodes: NodeApi<TreeNode>[];
      parentNode: NodeApi<TreeNode> | null;
    }) => {
      const { dragNodes } = args;
      const authoritative = draggingNodeRef.current
        ? [draggingNodeRef.current]
        : dragNodes;
      if (!onFileMove || authoritative.length === 0) {
        handleDragOverZoneChange(null);
        return;
      }

      const draggedNode = authoritative[0];
      // Check if the node can be dragged
      if (!canBeDragged(draggedNode.data)) {
        handleDragOverZoneChange(null);
        return;
      }

      const fromPath = draggedNode.data.path;
      let toPath: string;

      const arboristParent = args.parentNode;

      if (
        arboristParent === null ||
        arboristParent.id === '__REACT_ARBORIST_INTERNAL_ROOT__'
      ) {
        // Dropping at root level
        toPath = fromPath.split('/').pop() || '';
      } else {
        // Dropping inside a folder
        const parentPath = arboristParent.data.path;
        const fileName = fromPath.split('/').pop() || '';
        toPath = `${parentPath}/${fileName}`;

        // Auto-open the target folder
        if (!arboristParent.isOpen) {
          arboristParent.open();
        }
      }

      // Only proceed if path actually changed
      if (fromPath !== toPath) {
        // Block operations that can cause path duplication cascade
        const folderName = fromPath.split('/').pop() || '';
        const hasSelfDuplication = toPath.includes(fromPath + '/' + folderName);

        if (
          !toPath ||
          toPath.trim() === '' ||
          fromPath === toPath ||
          toPath.startsWith(fromPath + '/') ||
          hasSelfDuplication
        ) {
          handleDragOverZoneChange(null);
          return;
        }

        // Check for duplicate files/folders at destination
        const { hasDuplicate, conflictType } = checkForDuplicates(
          nodes,
          toPath,
          draggedNode.data.type,
        );

        if (hasDuplicate) {
          // Show dialog for all conflict types to let user decide
          if (onDuplicateConflict) {
            const fileName = fromPath.split('/').pop() || '';
            onDuplicateConflict({
              fileName,
              sourcePath: fromPath,
              targetPath: toPath,
              conflictType,
            });
          }

          handleDragOverZoneChange(null);
          return;
        }

        // Create the moved node data from the dragged node
        const movedNodeData = { ...draggedNode.data, path: toPath };

        // For folders, track files that will need path updates after the move
        const filesToUpdate: Array<{ oldPath: string; newPath: string }> = [];
        if (movedNodeData.type === 'folder' && openFiles) {
          openFiles.forEach((openFile) => {
            if (openFile.fileId.startsWith(fromPath + '/')) {
              // This file was inside the moved folder, calculate its new path
              const relativePath = openFile.fileId.substring(fromPath.length);
              const newFilePath = toPath + relativePath;

              filesToUpdate.push({
                oldPath: openFile.fileId,
                newPath: newFilePath,
              });
            }
          });
        }

        // Call onFileMove with files to update if it's a folder move
        const movePromise =
          movedNodeData.type === 'folder' && filesToUpdate.length > 0
            ? onFileMove(fromPath, toPath, filesToUpdate)
            : onFileMove(fromPath, toPath);

        movePromise
          .catch(() => {
            // If the move failed, rollback the file path updates
            if (filesToUpdate.length > 0 && updateOpenFile) {
              filesToUpdate.forEach(({ oldPath, newPath }) => {
                updateOpenFile(newPath, oldPath);
              });
            }
          })
          .then(() => {
            // Select the moved item using the data we already have
            if (movedNodeData.type === 'file') {
              selectedFileChange(movedNodeData);
            } else if (movedNodeData.type === 'folder') {
              onFolderSelect(movedNodeData);
            }
          });
      }

      // Reset after handling the drop
      handleDragOverZoneChange(null);
      draggingNodeRef.current = null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      onFileMove,
      openFiles,
      nodes,
      updateOpenFile,
      selectedFileChange,
      onFolderSelect,
    ],
  );

  const handleResourceImport = useCallback(
    (params: { isFolder?: boolean }): void => {
      const { isFolder = false } = params;

      if (isReadOnly) {
        console.warn('File tree is read-only. Cannot import.');
        return;
      }

      let importAtPath = '';
      const treeApi = treeApiRef.current;

      if (selectedFolder && treeApi?.get(selectedFolder.path)) {
        importAtPath = selectedFolder.path;
      } else if (selectedNode && treeApi?.get(selectedNode.path)) {
        importAtPath = selectedNode.path;
        if (isFileNode(selectedNode)) {
          const parts = selectedNode.path.split('/');
          parts.pop();
          importAtPath = parts.join('/');
        }
      }

      onResourceImport({ path: importAtPath, isFolder });
    },
    [isReadOnly, selectedNode, selectedFolder, onResourceImport],
  );

  useImperativeHandle(ref, () => ({
    handleFileCreate,
    handleFolderCreate,
    handleDrop,
    handleResourceImport,
  }));

  const renderFileNode = useCallback(
    (nodeProps: NodeRendererProps<TreeNode>): JSX.Element => (
      <FileNode
        {...nodeProps}
        isEditing={
          nodeProps.node.data.path === isEditingAt ||
          nodeProps.node.data.path ===
            `${isCreating?.path}/${TEMP_CREATED_NODE_NAME}`
        }
        isReadOnly={isReadOnly}
        onEditStart={(): void => {
          setIsEditingAt(nodeProps.node.data.path);
        }}
        onEditSubmit={async (newName): Promise<void> => {
          if (isCreating !== null) {
            const path = isCreating?.path
              ? `${isCreating.path}/${newName}`
              : newName;
            if (isCreating.type === 'file') {
              await onFileCreate(path);
            } else {
              await onFolderCreate(path);
            }
            setIsCreating(null);
          }
          if (isEditingAt !== null) {
            // Use treeApi to find the node in the complete tree (need this to nested folders)
            const foundNode = treeApiRef.current?.get(isEditingAt);
            const nodeType = foundNode?.data?.type ?? 'file';
            await onFileRename(isEditingAt, newName, nodeType);
            setIsEditingAt(null);
          }
        }}
        onEditCancel={(): void => {
          setIsCreating(null);
          setIsEditingAt(null);
        }}
        onDelete={(): Promise<void> =>
          onFileDelete(nodeProps.node.data.path, nodeProps.node.data.type)
        }
        renderNodeIcon={renderNodeIcon}
      />
    ),
    [
      isCreating,
      isEditingAt,
      isReadOnly,
      onFileCreate,
      onFolderCreate,
      onFileRename,
      onFileDelete,
      renderNodeIcon,
    ],
  );

  const disableDragNode = useCallback((data: TreeNode): boolean => {
    // Disable drag if the node cannot be dragged
    return !canBeDragged(data);
  }, []);

  const disableDropNode = useCallback(
    (args: {
      parentNode: NodeApi<TreeNode>;
      dragNodes: NodeApi<TreeNode>[];
      index: number;
    }): boolean => {
      const { dragNodes } = args;

      if (dragNodes.length === 0) {
        return true; // Disable drop if no nodes
      }

      const draggedNode = dragNodes[0];
      // Disable drop if the dragged node cannot be dragged
      return !canBeDragged(draggedNode.data);
    },
    [],
  );

  const renderDragPreview = useCallback(
    (props: {
      offset: { x: number; y: number } | null;
      mouse: { x: number; y: number } | null;
      dragIds: string[];
      isDragging: boolean;
    }): JSX.Element => {
      return (
        <DragPreview
          offset={props.offset}
          mouse={props.mouse}
          dragIds={props.dragIds}
          isDragging={props.isDragging}
          data={data}
          renderNodeIcon={renderNodeIcon}
        />
      );
    },
    [data, renderNodeIcon],
  );

  return (
    <>
      <div
        className={clsx(styles['tree-container'], {
          [styles['tree-container--drag-over']]: dragOverZone === 'root',
        })}
        style={{ height }}
      >
        {nodes && nodes.length > 0 ? (
          <ContextMenu.Root>
            <ContextMenu.Trigger
              onContextMenu={(e): false | void =>
                isReadOnly && e.preventDefault()
              } // disable native context menu
              disabled={isReadOnly}
            >
              <div
                onDragOver={(e): void => {
                  e.preventDefault();
                  const target = e.target as HTMLElement;
                  const isOverRow = target.closest(
                    `.${styles['tree-row-container']}`,
                  );
                  if (!isOverRow) {
                    handleDragOverZoneChange('root');
                  }
                }}
                onDrop={(e): void => {
                  if (dragOverZoneRef.current !== 'root') return;
                  const dragNode = draggingNodeRef.current;
                  if (!dragNode || !canBeDragged(dragNode.data)) return;
                  e.stopPropagation();
                  handleDrop({ dragNodes: [dragNode], parentNode: null });
                  draggingNodeRef.current = null;
                }}
              >
                <Tree
                  ref={treeApiRef}
                  className={styles['tree']}
                  data={data}
                  idAccessor={(node): string => node.path}
                  width={'100%'}
                  height={height}
                  openByDefault={false}
                  disableMultiSelection={true}
                  initialOpenState={defaultOpenFoldersState}
                  disableDrag={isReadOnly ? isReadOnly : disableDragNode}
                  disableDrop={isReadOnly || disableDropNode}
                  onMove={handleDrop}
                  renderDragPreview={renderDragPreview}
                  renderCursor={(): null => null}
                  rowHeight={22}
                  renderRow={(
                    rowProps: RowRendererProps<TreeNode>,
                  ): JSX.Element => {
                    return (
                      <FileRow
                        {...rowProps}
                        selectedNode={selectedNode}
                        selectedFolder={selectedFolder}
                        dragOverZone={dragOverZone}
                        onDragOverChange={handleDragOverZoneChange}
                        onDragStart={(): void => {
                          draggingNodeRef.current = rowProps.node;
                          treeApiRef.current?.deselectAll?.();
                        }}
                        onSelect={(): void => handleNodeSelect(rowProps.node)}
                        onDelete={(): Promise<void> =>
                          onFileDelete(
                            rowProps.node.data.path,
                            rowProps.node.data.type,
                          )
                        }
                        onCreate={(type, path): void => {
                          if (type === 'file') {
                            handleFileCreate(path);
                          } else if (type === 'folder') {
                            handleFolderCreate(path);
                          }
                        }}
                        onRename={(): void =>
                          setIsEditingAt(rowProps.node.data.path)
                        }
                        onResourceImport={onResourceImport}
                        isProjectReadOnly={isReadOnly}
                        isBricksSelected={isBricksSelected}
                      />
                    );
                  }}
                >
                  {renderFileNode}
                </Tree>
              </div>
            </ContextMenu.Trigger>
            <TreeContextMenu
              onCreate={(type) => (): void => {
                if (type === 'file') {
                  handleFileCreate('');
                } else if (type === 'folder') {
                  handleFolderCreate('');
                }
              }}
              onAddBrick={onAddBrick}
              onAddSketchLibrary={onAddSketchLibrary}
              onResourceImport={onResourceImport}
            />
          </ContextMenu.Root>
        ) : (
          <div className={clsx(styles['file-tree-skeleton'])}>
            <Skeleton variant="rounded" count={5} />
          </div>
        )}
      </div>
    </>
  );
});

FileTree.displayName = 'FileTree';
export default memo(FileTree);
