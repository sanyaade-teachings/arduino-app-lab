import {
  BoardUpdateDialogLogic,
  FlashBoardDialogLogic,
  SidePanelLogic,
  WhatsNewAdHocLogic,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';

export type UseMainLogic = () => {
  sidePanelLogic: SidePanelLogic;
  boardUpdateDialogLogic: BoardUpdateDialogLogic;
  flashBoardDialogLogic: FlashBoardDialogLogic;
  whatsNewAdHocLogic: WhatsNewAdHocLogic;
};
