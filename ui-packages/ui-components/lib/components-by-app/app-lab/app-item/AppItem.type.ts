import { AppInfo, AppStatus } from '@cloud-editor-mono/infrastructure';

export interface AppItemProps {
  id?: string;
  variant?: 'default' | 'skeleton';
  name?: string;
  description?: string;
  icon?: string;
  status?: AppStatus;
  example?: boolean;
  byteSize?: number;
  defaultApp?: AppInfo;
  onRename?: () => void;
  onDuplicate?: () => void;
  onExport?: () => void;
  onSetAsDefault?: () => void;
  onDelete?: () => void;
}
