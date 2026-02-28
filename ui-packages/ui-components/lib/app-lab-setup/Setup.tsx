import { ArduinoLogo } from '@cloud-editor-mono/images/assets/icons';
import clsx from 'clsx';

import { BoardSection } from '../app-lab-board-section';
import { ArduinoLoader } from '../essential/loader';
import { useI18n } from '../i18n/useI18n';
import { Large, XSmall } from '../typography';
import { setupMessages, welcomeMessages } from './messages';
import SectionContainer from './sections/SectionContainer';
import styles from './setup.module.scss';
import {
  AppLabSetupItemId,
  SetupContentLogicMap,
  UseSetupLogic,
} from './setup.type';
import { sections, setupItems } from './setupSpec';
import Welcome from './sub-components/Welcome';

interface SetupProps {
  setupLogic: UseSetupLogic;
}

const Setup: React.FC<SetupProps> = (props: SetupProps) => {
  const { setupLogic } = props;
  const {
    contentLogicMap,
    currentStep,
    stepIsSkippable,
    boards,
    selectedBoard,
    selectBoard,
    autoSelectBoard,
    isBoard,
    showLoader,
    showBoardSelectionPage,
    showPostSelectionSetup,
    showBoardConnPswPrompt,
    onConnPswCancel,
    onConnPswSubmit,
    isBoardConnectingOrChecking,
    connToBoardError,
    showConfirmButton = true,
    boardItem,
    onOpenTerminal,
    terminalError,
    onBackStep,
    unlockAutoFlow,
  } = setupLogic();

  const { formatMessage } = useI18n();

  return showLoader ? (
    <ArduinoLoader />
  ) : showBoardSelectionPage ? (
    <Welcome
      isLoading={isBoard === undefined}
      boards={boards}
      onSelectBoard={selectBoard}
      showBoardConnPswPrompt={showBoardConnPswPrompt}
      onConnPswCancel={onConnPswCancel}
      onConnPswSubmit={onConnPswSubmit}
      isBoardConnectingOrChecking={isBoardConnectingOrChecking}
      connToBoardError={connToBoardError}
    />
  ) : showPostSelectionSetup ? (
    <div className={styles['setup-container']}>
      <div className={styles['setup-side-panel']}>
        <div className={styles['side-panel-content']}>
          <ArduinoLogo className={styles['arduino-logo']} />
          <Large bold className={styles['title']}>
            {formatMessage(welcomeMessages.title)}
          </Large>
          <ol className={styles['items-list']}>
            {setupItems.map((item) =>
              item.enabled ? (
                <li
                  key={item.id}
                  className={clsx(styles['item'], {
                    [styles['selected']]: item.id === currentStep,
                    [styles['completed']]: currentStep && item.id < currentStep,
                  })}
                >
                  <XSmall bold={item.id === currentStep}>
                    {formatMessage(setupMessages[item.id])}
                  </XSmall>
                </li>
              ) : null,
            )}
          </ol>
        </div>
        <div className={styles['board-section']}>
          <BoardSection
            boardItem={boardItem}
            isBoard={isBoard}
            boards={boards}
            selectedBoard={selectedBoard}
            autoSelectBoard={autoSelectBoard}
            onOpenTerminal={onOpenTerminal}
            terminalError={terminalError}
          />
        </div>
      </div>
      <div className={styles['setup-content']}>
        <SectionContainer
          key={currentStep}
          currentStep={currentStep as AppLabSetupItemId}
          itemsLength={setupItems.length}
          skippable={stepIsSkippable}
          onBack={onBackStep}
          unlockAutoFlow={unlockAutoFlow}
          renderSection={sections[currentStep as AppLabSetupItemId]}
          sectionLogic={
            (contentLogicMap as SetupContentLogicMap)[
              currentStep as AppLabSetupItemId
            ]
          }
          showConfirmButton={showConfirmButton}
        />
      </div>
    </div>
  ) : null;
};

export default Setup;
