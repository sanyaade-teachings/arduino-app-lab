import { ArduinoLogo } from '@cloud-editor-mono/images/assets/icons';
import {
  AppLabEditorPanel,
  isFileNode,
  MultipleConsolePanel,
  WorkspaceLayout,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
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
    importFileDialogLogic,
    openImportFileDialog,
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
      importFileDialogLogic,
      openImportFileDialog,
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
      importFileDialogLogic,
      openImportFileDialog,
    ],
  );

  return (
    <WorkspaceLayout
      sideContent={(api): React.ReactNode => (
        <FilesManagerSection
          isCollapsed={api.isCollapsed}
          toggleCollapsed={api.toggleCollapsed}
          logic={filesManagerSectionLogic}
        />
      )}
      editorContent={
        <div className={styles['editor']}>
          {(selectedNode && isFileNode(selectedNode)) ||
          selectedFile?.fileExtension === 'brick' ? (
            <AppLabEditorPanel appLabEditorLogic={appLabEditorPanelLogic} />
          ) : (
            <div className={styles['empty-editor']}>
              <ArduinoLogo />
            </div>
          )}
        </div>
      }
      consoleContent={(api): React.ReactNode => (
        <MultipleConsolePanel
          multipleConsolePanelLogic={multipleConsolePanelLogic}
          isCollapsed={api.isCollapsed}
          toggleCollapse={api.toggleCollapsed}
          isMaximized={api.isMaximized}
          onMaximize={api.toggleMaximize}
          onMinimize={api.toggleMaximize}
        />
      )}
    />
  );
};

export default AppFilesSection;
