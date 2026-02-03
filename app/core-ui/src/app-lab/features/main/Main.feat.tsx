import {
  AppLabSidePanel,
  BoardUpdateDialog,
  FlashBoardDialog,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { Themes } from '@cloud-editor-mono/ui-components/themes/theme.type';
import { Outlet } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';

import { ThemeContext } from '../../../common/providers/theme/themeContext';
import { SetupContext } from '../../providers/setup/setupContext';
import { useBoardLifecycleStore, useBoards } from '../../store/boards/boards';
import { Flasher } from '../flasher/Flasher.feat';
import FooterBar from '../footer-bar/FooterBar.feat';
import Setup from '../setup/Setup.feat';
import { useMainLogic } from './main.logic';
import styles from './main.module.scss';

const AppLabMain: React.FC = () => {
  const { sidePanelLogic, boardUpdateDialogLogic, flashBoardDialogLogic } =
    useMainLogic();
  const boardsProps = useBoards();

  const { setupCompleted } = useContext(SetupContext);

  const { setTheme } = useContext(ThemeContext);
  useEffect(() => {
    setTheme(Themes.DarkTheme);
  }, [setTheme]);

  const { boardIsFlashing, boardIsReachable } = useBoardLifecycleStore();

  return boardIsFlashing ? (
    <Flasher selectBoard={boardsProps.autoSelectBoard} />
  ) : (
    <>
      <Setup boardsProps={boardsProps} />
      <BoardUpdateDialog logic={boardUpdateDialogLogic} />
      <FlashBoardDialog logic={flashBoardDialogLogic} />
      {setupCompleted && boardIsReachable ? (
        <>
          <div className={styles['container']}>
            <AppLabSidePanel sidePanelLogic={sidePanelLogic} />
            <div className={styles['outlet']}>
              <Outlet />
            </div>
          </div>

          <FooterBar />
        </>
      ) : null}
    </>
  );
};

export default AppLabMain;
