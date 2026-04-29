import { setCSSVariable } from '@cloud-editor-mono/common';
import { AddTab, ChevronDown } from '@cloud-editor-mono/images/assets/icons';
import {
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import clsx from 'clsx';
import { Key, useCallback, useEffect, useRef, useState } from 'react';
import { MenuTriggerState } from 'react-stately';

import DropdownMenuButton from '../essential/dropdown-menu/DropdownMenuButton';
import FilterableListButton from '../essential/filterable-list/FilterableListButton';
import {
  FileExtension,
  SUPPORTED_TYPES,
  TabsBarLogic,
} from './EditorTabsBar.type';
import { useTabsBarActions } from './hooks/useTabsBarActions';
import {
  useTabsBarReorder,
  verticalColumnCollisionStrategy,
} from './hooks/useTabsBarReorder';
import { useTabsBarScroll } from './hooks/useTabsBarScroll';
import EditorTab from './sub-components/EditorTab';
import { newTabMenuSections } from './sub-components/editorTabMenuSpec';
import RenameEditorTab, {
  RenameTabRole,
} from './sub-components/RenameEditorTab';
import SortableEditorTab from './sub-components/SortableEditorTab';
import styles from './tabs-bar.module.scss';

interface EditorTabsBarProps {
  tabsBarLogic: TabsBarLogic;
  classes?: { container?: string; selected?: string; tab?: string };
}

const EditorTabsBar: React.FC<EditorTabsBarProps> = (
  props: EditorTabsBarProps,
) => {
  const { tabsBarLogic, classes } = props;
  const {
    tabs,
    selectableMainFile,
    selectedTab,
    selectTab,
    selectSecretsTab,
    closeTab,
    updateTabOrder,
    sketchDataIsLoading,
    unsavedFileIds,
    makeUniqueFileName,
    getFileIcon,
    isReadOnly,
    addFile,
    renameFile,
    deleteFile,
    validateFileName,
    replaceFileNameInvalidCharacters,
    onBeforeFileAction,
    dispatchNewFileAction,
    setDispatchNewFileAction,
    showFileSearch,
  } = tabsBarLogic();

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollTabsRef = useRef<HTMLUListElement>(null);
  const renameTabRef = useRef<HTMLLIElement>(null);

  const [, setOpenMenuMap] = useState<Map<string, MenuTriggerState>>(new Map());

  const {
    filePath,
    newTabMenuAction,
    tabAction,
    addNewTab,
    renameTab,
    handleImportedFile,
    onTabClick,
    isNewTabAdded,
    newTabActionType,
    renamingFileId,
  } = useTabsBarActions(
    tabs,
    selectedTab,
    selectableMainFile,
    inputRef,
    selectTab,
    selectSecretsTab,
    closeTab,
    addFile,
    renameFile,
    deleteFile,
    makeUniqueFileName,
    replaceFileNameInvalidCharacters,
    onBeforeFileAction,
  );

  const {
    activeTab,
    dropIndicator,
    sensors,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useTabsBarReorder({
    tabs,
    updateTabOrder,
  });

  const { isScrollable } = useTabsBarScroll({
    scrollRef: scrollTabsRef,
    selectedFileId: selectedTab?.fileId,
  });

  useEffect(() => {
    if (renamingFileId && renameTabRef.current) {
      renameTabRef.current.scrollIntoView();
    }
  }, [renamingFileId]);

  useEffect(() => {
    if (dispatchNewFileAction && setDispatchNewFileAction) {
      newTabMenuAction(dispatchNewFileAction);
      setDispatchNewFileAction(null);
    }
  }, [newTabMenuAction, dispatchNewFileAction, setDispatchNewFileAction]);

  const renderTabNodes = (): JSX.Element => {
    const items = tabs.map((t) => ({ ...t, id: t.fileId }));

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={verticalColumnCollisionStrategy}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items}>
          {items.map((item) => {
            const { id, ...tab } = item;

            return !isReadOnly && tab.fileId === renamingFileId ? (
              <RenameEditorTab
                ref={renameTabRef}
                key={id}
                fileId={tab.fileId}
                fileName={
                  tab.fileName ??
                  makeUniqueFileName(`Untitled`, tab.fileExtension ?? '')
                }
                fileExtension={tab.fileExtension}
                Icon={getFileIcon(tab.fileExtension)}
                isSelected={selectedTab?.fileId === tab.fileId}
                tabAction={{ role: RenameTabRole.Rename, handler: renameTab }}
                validateFileName={validateFileName}
                replaceFileNameInvalidCharacters={
                  replaceFileNameInvalidCharacters
                }
              />
            ) : (
              <SortableEditorTab
                id={id}
                key={id}
                tabData={tab}
                isSelected={selectedTab?.fileId === tab.fileId}
                Icon={tab.Icon}
                dataIsLoading={sketchDataIsLoading}
                isMainFile={tab.fileId === selectableMainFile?.fileId}
                isUnsaved={Boolean(
                  tab.fileId && unsavedFileIds?.has(tab.fileId),
                )}
                selectTab={onTabClick}
                isReadOnly={isReadOnly || !!tab.isMetadataReadOnly}
                tabAction={tabAction}
                setOpenMenuMap={setOpenMenuMap}
                dropIndicator={
                  dropIndicator?.tabId === tab.fileId
                    ? dropIndicator.direction
                    : undefined
                }
              />
            );
          })}
        </SortableContext>
        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: { active: { opacity: '0.5' } },
            }),
          }}
        >
          {activeTab ? (
            <EditorTab
              tabData={activeTab}
              isSelected={activeTab.fileId === selectedTab?.fileId}
              Icon={activeTab.Icon}
              classes={{ tab: styles['tab-drag-overlay'] }}
              isReadOnly={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  };

  const renderCreateTabNode = (): JSX.Element => {
    const ext =
      newTabActionType !== undefined
        ? FileExtension[newTabActionType as keyof typeof FileExtension]
        : '';
    return (
      <RenameEditorTab
        ref={renameTabRef}
        key={filePath + makeUniqueFileName(`Untitled`, ext)}
        fileName={makeUniqueFileName(`Untitled`, ext)}
        fileExtension={ext}
        Icon={getFileIcon(ext)}
        isSelected={true}
        tabAction={{ role: RenameTabRole.Create, handler: addNewTab }}
        validateFileName={validateFileName}
        replaceFileNameInvalidCharacters={replaceFileNameInvalidCharacters}
      />
    );
  };

  const getFilterableListSections = useCallback(() => {
    return {
      name: 'tabs-list',
      items: tabs.map((tab) => ({
        id: tab.fileId,
        label: {
          id: `tabList.${tab.fileId}`,
          defaultMessage: `${tab.fileName}`,
          description: `Tab file name: ${tab.fileName}`,
        },
        labelPrefix: <div>{tab.Icon}</div>,
      })),
    };
  }, [tabs]);

  const onFilterableListAction = useCallback(
    (key: Key): void => {
      const tab = tabs.find((tab) => tab.fileId === key);
      if (tab) {
        onTabClick(tab);
      }
    },
    [tabs, onTabClick],
  );

  const renameTabIndex = tabs.findIndex((tab) => tab.fileId === renamingFileId);

  setCSSVariable(styles.renameTabIndex, `${renameTabIndex}`);

  return (
    <div
      className={clsx(styles['tabs-bar'], classes?.container, {
        [styles['tabs-bar-scrollable']]: isScrollable,
      })}
    >
      <ul
        ref={scrollTabsRef}
        className={clsx(styles['tabs-list'], {
          [styles['first-tab-renaming']]: renameTabIndex === 0,
          [styles['other-tabs-renaming']]:
            renameTabIndex > 0 && renameTabIndex < tabs.length - 1,
          [styles['last-tab-renaming']]:
            tabs.length > 0 && renameTabIndex === tabs.length - 1,
          [styles['new-tab-renaming']]: isNewTabAdded,
        })}
      >
        {!sketchDataIsLoading && tabs.length ? (
          <>
            {renderTabNodes()}
            {isNewTabAdded && renderCreateTabNode()}
          </>
        ) : (
          <EditorTab
            isSelected={true}
            dataIsLoading={!!sketchDataIsLoading}
            isReadOnly={isReadOnly}
          />
        )}
      </ul>
      <div className={styles['tabs-bar-right']}>
        {!isReadOnly ? (
          <DropdownMenuButton
            buttonChildren={<AddTab />}
            sections={newTabMenuSections}
            onAction={newTabMenuAction}
            classes={{
              dropdownMenuButtonWrapper: styles['tabs-bar-right-item'],
              dropdownMenuButton: styles['tabs-bar-right-button'],
              dropdownMenu: styles['tabs-bar-right-menu'],
              dropdownMenuItem: styles['new-tab-menu-item'],
            }}
          />
        ) : null}
        <input
          type="file"
          onChange={handleImportedFile}
          ref={inputRef}
          accept={SUPPORTED_TYPES.join(',')}
          className={styles['import-file-input']}
        />
        {isScrollable && showFileSearch && (
          <FilterableListButton
            buttonChildren={<ChevronDown />}
            getSections={getFilterableListSections}
            label={'Search tabs'}
            onAction={onFilterableListAction}
            classes={{
              wrapper: styles['tabs-bar-right-item'],
              button: styles['tabs-bar-right-button'],
              listContainer: styles['tabs-bar-right-menu'],
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EditorTabsBar;
