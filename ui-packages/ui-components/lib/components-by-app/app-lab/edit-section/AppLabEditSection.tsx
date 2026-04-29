import { ArduinoLogo } from '@cloud-editor-mono/images/assets/icons';
import {
  AppLabEditorPanel,
  isFileNode,
  MultipleConsolePanel,
  SplitPanel,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import clsx from 'clsx';
import { useCallback } from 'react';

import styles from './app-lab-edit-section.module.scss';
import {
  AppLabEditSectionLogic,
  FilesManagerSectionLogic,
} from './appLabEditSection.type';
import { FilesManagerSection } from './subcomponents/FilesManagerSection';

interface AppEditSectionProps {
  appLabEditSectionLogic: AppLabEditSectionLogic;
}

const AppFilesSection: React.FC<AppEditSectionProps> = (
  props: AppEditSectionProps,
) => {
  const { appLabEditSectionLogic } = props;
  const {
    app,
    appBricks,
    bricks,
    appLibraries,
    section,
    fileTree,
    selectedFile,
    selectedNode,
    selectedFolder,
    defaultOpenFoldersState,
    setSelectedFile,
    setSelectedFolder,
    openExternalLink,
    addAppBrick,
    deleteAppBrick,
    updateAppBrick,
    addAppCustomBrick,
    addFileHandler,
    renameFileHandler,
    deleteFileHandler,
    moveFileHandler,
    addSketchLibraryDialogLogic,
    openAddSketchLibraryDialog,
    deleteSketchLibrary,
    addFolderHandler,
    multipleConsolePanelLogic,
    renderIcon,
    appLabEditorPanelLogic,
    brickDetailLogic,
    configureAppBrickDialogLogic,
    updateOpenFile,
    renameAppCustomBrick,
    onDuplicateConflict,
    duplicateFileDialogLogic,
  } = appLabEditSectionLogic();

  // REFACTOR: should split this in different logics
  const filesManagerSectionLogic = useCallback<FilesManagerSectionLogic>(
    () => ({
      app,
      appBricks,
      bricks,
      appLibraries,
      section,
      fileTree,
      selectedFile,
      selectedNode,
      selectedFolder,
      defaultOpenFoldersState,
      setSelectedFile,
      setSelectedFolder,
      openExternalLink,
      addFileHandler,
      renameFileHandler,
      deleteFileHandler,
      addSketchLibraryDialogLogic,
      openAddSketchLibraryDialog,
      deleteSketchLibrary,
      addFolderHandler,
      addAppBrick,
      deleteAppBrick,
      updateAppBrick,
      renderIcon,
      brickDetailLogic,
      configureAppBrickDialogLogic,
      addAppCustomBrick,
      renameAppCustomBrick,
      moveFileHandler,
      updateOpenFile,
      appLabEditorPanelLogic,
      onDuplicateConflict,
      duplicateFileDialogLogic,
    }),
    [
      app,
      appBricks,
      bricks,
      appLibraries,
      section,
      fileTree,
      selectedFile,
      selectedNode,
      selectedFolder,
      defaultOpenFoldersState,
      setSelectedFile,
      setSelectedFolder,
      openExternalLink,
      addFileHandler,
      renameFileHandler,
      deleteFileHandler,
      addSketchLibraryDialogLogic,
      openAddSketchLibraryDialog,
      deleteSketchLibrary,
      addFolderHandler,
      addAppBrick,
      deleteAppBrick,
      updateAppBrick,
      renderIcon,
      brickDetailLogic,
      configureAppBrickDialogLogic,
      addAppCustomBrick,
      renameAppCustomBrick,
      moveFileHandler,
      updateOpenFile,
      appLabEditorPanelLogic,
      onDuplicateConflict,
      duplicateFileDialogLogic,
    ],
  );

  return (
    <SplitPanel
      classes={{
        container: styles['split'],
        gutter: styles['gutter'],
      }}
      storageKey="arduino:editor-sidebar-sizes"
      direction="horizontal"
      minSizePx={300}
      collapsedSizePx={44}
      collapseThresholdPx={44}
      initialSizes={[20, 80]}
    >
      {({
        toggleCollapsed: toggleSidebarCollapsed,
        isCollapsed: isSidebarCollapsed,
      }): JSX.Element[] => [
        // SIDE PANEL
        <FilesManagerSection
          key="sidebar"
          isCollapsed={isSidebarCollapsed}
          toggleCollapsed={toggleSidebarCollapsed}
          logic={filesManagerSectionLogic}
        />,

        // EDITOR + CONSOLE PANEL
        <SplitPanel
          key="editor-console"
          classes={{
            container: clsx(styles['split-item'], styles['split-item-right']),
            gutter: clsx(styles['gutter'], styles['horizontal']),
          }}
          storageKey="arduino:editor-console-sizes"
          direction="vertical"
          collapsablePanelIndex={1}
          minSizePx={250}
          collapsedSizePx={36}
          collapseThresholdPx={30}
          maximizedThresholdPx={40}
          initialSizes={[100, 0]}
        >
          {({
            isCollapsed: isConsoleCollapsed,
            toggleCollapsed: toggleConsoleCollapsed,
            isMaximized: isConsoleMaximized,
            toggleMaximize: toggleConsoleMaximize,
            minimize: minimizeConsole,
          }): JSX.Element[] => [
            // EDITOR PANEL
            <div className={styles['top-panel']} key="editor">
              {(selectedNode && isFileNode(selectedNode)) ||
              selectedFile?.fileExtension === 'brick' ? (
                <AppLabEditorPanel appLabEditorLogic={appLabEditorPanelLogic} />
              ) : (
                <div className={styles['empty-editor']}>
                  <ArduinoLogo />
                </div>
              )}
            </div>,

            // CONSOLE PANEL
            <div className={styles['bottom-panel']} key={'console'}>
              <MultipleConsolePanel
                multipleConsolePanelLogic={multipleConsolePanelLogic}
                isCollapsed={isConsoleCollapsed}
                toggleCollapse={toggleConsoleCollapsed}
                isMaximized={isConsoleMaximized}
                onMaximize={toggleConsoleMaximize}
                onMinimize={minimizeConsole}
              />
            </div>,
          ]}
        </SplitPanel>,
      ]}
    </SplitPanel>
  );
};

export default AppFilesSection;
