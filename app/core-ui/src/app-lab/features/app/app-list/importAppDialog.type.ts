export interface ImportAppResult {
  id: string;
  name: string;
}

export enum ImportStatus {
  Idle = 'idle',
  Uploading = 'uploading',
  UploadFailed = 'upload-failed',
}

export type ImportAppDialogLogic = () => {
  open: boolean;
  status: ImportStatus;
  errorMessage?: string;
  onOpenChange: (open: boolean) => void;
  startImport: () => void;
  handleFileDrop: (file: File) => void;
};
