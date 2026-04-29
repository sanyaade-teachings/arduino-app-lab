import { EditorPanelLogic } from '../../../editor-panel';
import { KeywordMap, SelectableFileData } from '../../shared';

export type AppLabEditorPanelLogic = () => {
  editorPanelLogic: EditorPanelLogic;
  getKeywords: () => KeywordMap | undefined;
  onCopyCode: () => void;
  openFiles: SelectableFileData[];
  readOnly: boolean;
};
