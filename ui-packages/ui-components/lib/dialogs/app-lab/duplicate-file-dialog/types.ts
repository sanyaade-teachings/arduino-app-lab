export type ConflictType =
  | 'file-file'
  | 'file-folder'
  | 'folder-file'
  | 'folder-folder'
  | null;

export interface OnDuplicateConflictParams {
  fileName: string;
  sourcePath: string;
  targetPath: string;
  conflictType: ConflictType;
}

export interface DuplicateFileDialogState {
  open: boolean;
  fileName: string;
  sourcePath?: string;
  targetPath?: string;
  conflictType: ConflictType;
}

export type DuplicateFileDialogLogic = () => {
  open: boolean;
  fileName: string;
  conflictType: ConflictType;
  onOverwrite: () => Promise<boolean>;
  onKeepBoth: () => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
};
