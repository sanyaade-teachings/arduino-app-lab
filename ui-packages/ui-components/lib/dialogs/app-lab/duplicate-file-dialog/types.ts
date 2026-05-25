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
  isExternalImport?: boolean;
  file?: File;
}

export interface DuplicateFileDialogState {
  open: boolean;
  fileName: string;
  sourcePath?: string;
  targetPath?: string;
  conflictType: ConflictType;
  isExternalImport?: boolean;
}

export type DuplicateFileDialogLogic = () => {
  open: boolean;
  fileName: string;
  conflictType: ConflictType;
  onOverwrite: () => Promise<boolean>;
  onKeepBoth: () => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
};
