import { CloseX, UnsavedBadge } from '@cloud-editor-mono/images/assets/icons';
import clsx from 'clsx';
import { Key, memo, ReactElement, useCallback, useRef, useState } from 'react';
import { useMenuTrigger } from 'react-aria';
import {
  Item,
  MenuTriggerState,
  Section,
  useMenuTriggerState,
} from 'react-stately';

import { DropdownMenuPopover } from '../../essential/dropdown-menu';
import DropdownMenu from '../../essential/dropdown-menu/DropdownMenu';
import { IconButton } from '../../essential/icon-button';
import { WrapperTitle } from '../../essential/wrapper-title';
import { useI18n } from '../../i18n/useI18n';
import { Skeleton } from '../../skeleton';
import { XXSmall } from '../../typography';
import {
  NewTabMenuItemIds,
  SelectableFileData,
  TabMenuItemIds,
  TabMenuItemType,
} from '../EditorTabsBar.type';
import styles from './editor-tab.module.scss';
import { tabMenuSections } from './editorTabMenuSpec';

export interface EditorTabProps {
  id?: string;
  tabData?: SelectableFileData;
  Icon?: React.ReactNode;
  isSelected: boolean;
  selectTab?: (
    tab: SelectableFileData,
    event?: React.MouseEvent<HTMLElement, MouseEvent> | undefined,
  ) => void;
  dataIsLoading?: boolean;
  isMainFile?: boolean;
  tabAction?: (key: NewTabMenuItemIds, fileId: string) => void;
  isUnsaved?: boolean;
  deleteFile?: () => void;
  isReadOnly: boolean;
  setOpenMenuMap?: React.Dispatch<
    React.SetStateAction<Map<string, MenuTriggerState>>
  >;
  classes?: { selected?: string; tab?: string };
}

const EditorTab = (props: EditorTabProps): React.ReactElement => {
  const {
    tabData,
    Icon,
    isSelected,
    selectTab,
    dataIsLoading,
    isUnsaved,
    tabAction,
    isReadOnly,
    setOpenMenuMap,
    classes,
  } = props;

  const { formatMessage } = useI18n();
  const [closeTooltipVisible, setCloseTooltipVisible] = useState(false);
  const state = useMenuTriggerState({});
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { menuProps } = useMenuTrigger<TabMenuItemType>({}, state, buttonRef);

  const onTabAction = useCallback(
    (key: Key): void =>
      tabAction && tabAction(key as NewTabMenuItemIds, tabData?.fileId ?? ''),
    [tabData?.fileId, tabAction],
  );

  const renderTabInfo = (): JSX.Element => (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      data-file-id={tabData?.fileId}
      className={clsx(styles.tab, classes?.tab, {
        [styles['tab-selected']]: isSelected,
        [classes?.selected ?? '']: isSelected,
      })}
      onClick={(e): void => {
        if (!tabData) {
          return;
        }
        selectTab && selectTab(tabData, e);
      }}
      onContextMenu={(e): void => {
        if (isReadOnly) {
          return;
        }

        e.preventDefault();
        state.open();

        if (tabData && setOpenMenuMap) {
          setOpenMenuMap((prev) => {
            const newMap = new Map(prev);
            newMap.forEach((state, key) => {
              if (key !== tabData.fileId) {
                state.close();
              }
            });
            newMap.set(tabData.fileId, state);
            return newMap;
          });
        }
      }}
    >
      <div
        className={clsx({
          [styles['tab-icon']]: Icon,
        })}
      >
        {Icon}
      </div>
      <div className={styles['tab-label']}>{tabData?.fileFullName}</div>
      {state.isOpen && (
        <DropdownMenuPopover
          triggerRef={buttonRef}
          state={state}
          classes={{
            dropdownMenuPopover: styles['tab-menu-popover'],
          }}
        >
          <DropdownMenu
            {...menuProps}
            onAction={onTabAction}
            classes={{
              dropdownMenu: styles['tab-menu'],
            }}
            useStaticPosition={true}
          >
            {tabMenuSections.map((section) => (
              <Section key={section.name} items={section.items}>
                {(item): ReactElement => {
                  const label =
                    typeof item.label === 'string'
                      ? item.label
                      : formatMessage(item.label);

                  return (
                    <Item textValue={label}>
                      <XXSmall>
                        {item.labelPrefix}
                        {label}
                        {item.labelSuffix}
                      </XXSmall>
                    </Item>
                  );
                }}
              </Section>
            ))}
          </DropdownMenu>
        </DropdownMenuPopover>
      )}

      <div
        className={clsx(styles['tab-actions'], {
          [styles['tab-unsaved']]: isUnsaved,
        })}
      >
        {isUnsaved && (
          <div className={styles['tab-unsaved-badge']}>
            <UnsavedBadge />
          </div>
        )}
        {tabData && !tabData.isFixed && (
          <IconButton
            onPress={(): void => onTabAction(TabMenuItemIds.Close)}
            label="Close"
            title="Close"
            Icon={CloseX}
            onMouseEnter={(): void => setCloseTooltipVisible(true)}
            onMouseLeave={(): void => setCloseTooltipVisible(false)}
            classes={{
              button: styles['tab-close-button'],
              icon: styles['tab-close-button-icon'],
              tooltip: styles['tab-close-button-tooltip'],
            }}
          />
        )}
      </div>
    </div>
  );

  return !dataIsLoading ? (
    <WrapperTitle
      title={closeTooltipVisible ? undefined : tabData?.fileId}
      classNames={{ tooltip: styles['tab-close-button-tooltip'] }}
    >
      {renderTabInfo()}
    </WrapperTitle>
  ) : (
    <div
      className={clsx(
        styles['tab'],
        styles['tab-selected'],
        styles['tab-is-loading'],
      )}
    >
      <div className={styles['tab-skeleton']}>
        <Skeleton variant="rounded" count={1} />
      </div>
    </div>
  );
};

EditorTab.displayName = 'EditorTab';
export default memo(EditorTab);
