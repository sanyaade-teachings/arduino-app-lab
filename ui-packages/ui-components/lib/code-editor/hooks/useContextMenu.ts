import {
  readText,
  writeText,
} from '@bcmi-labs/cloud-editor-domain/src/services/services-by-app/app-lab';
import { Config } from '@cloud-editor-mono/common';
import {
  indentLess,
  indentMore,
  redo,
  selectAll,
  toggleComment,
  undo,
} from '@codemirror/commands';
import { openSearchPanel } from '@codemirror/search';
import { EditorView } from '@codemirror/view';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AriaMenuOptions, useMenuTrigger } from 'react-aria';
import { MenuTriggerState, useMenuTriggerState } from 'react-stately';
import { useClickAway, useEvent as useEventListener } from 'react-use';

import { CodeMirrorEventAnnotation } from '../../code-mirror/codeMirror.type';
import {
  codeMirrorAnnotationMap,
  getCurrentSelectedStrings,
} from '../../code-mirror/utils';
import {
  ClickPosition,
  ContextMenuHandlerDictionary,
  ContextMenuItemIds,
  ContextMenuItemType,
} from '../../context-menu/contextMenu.type';
import { OnChangeHandlerSetCode } from '../codeEditor.type';

type UseContextMenu = (
  viewInstance: EditorView | null,
  setCode: OnChangeHandlerSetCode,
  code?: string | null,
) => {
  clickPosition?: ClickPosition;
  onContextMenuOpen: (e: Event) => void;
  onContextMenuClose: (e: KeyboardEvent) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  menuRef: React.RefObject<HTMLDivElement>;
  menuProps: AriaMenuOptions<ContextMenuItemType>;
  clickHandlers: ContextMenuHandlerDictionary;
  disabledKeys: ContextMenuItemIds[];
  state: MenuTriggerState;
};

export const useContextMenu: UseContextMenu = function (
  viewInstance: EditorView | null,
  setCode: OnChangeHandlerSetCode,
  code?: string | null,
): ReturnType<UseContextMenu> {
  const [clickPosition, setClickPosition] = useState<ClickPosition>();
  const [controlledOpen, setControlledOpen] = useState(false);
  const [disabledKeys, setDisabledKeys] = useState<ContextMenuItemIds[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const internalClipboard = useRef<string | null>(null);

  const state = useMenuTriggerState({});

  const { menuProps } = useMenuTrigger<ContextMenuItemType>(
    {},
    state,
    containerRef,
  );

  const currentSelectedStrings = getCurrentSelectedStrings(
    code,
    viewInstance?.state.selection,
  );

  const clickHandlers: ContextMenuHandlerDictionary = {
    [ContextMenuItemIds.Copy]: async (): Promise<void> => {
      const selectedText = currentSelectedStrings
        ?.map((el) => el.label)
        .join('\n');
      if (selectedText) {
        await writeText(selectedText);
        internalClipboard.current = selectedText;
      }
    },
    [ContextMenuItemIds.Paste]: async (): Promise<void> => {
      const selection = viewInstance?.state.selection.ranges;

      // In App Lab, use the internal clipboard to avoid navigator.clipboard.readText()
      // which triggers an OS-level permission prompt.
      const clipboardValue =
        Config.APP_NAME === 'App Lab'
          ? internalClipboard.current
          : await readText();

      if (!clipboardValue) return;

      if ((code || code === '') && selection) {
        const editorValue = viewInstance.state.doc.toString();
        viewInstance.dispatch({
          changes: {
            from: 0,
            to: editorValue.length,
            insert:
              code.slice(0, selection[0].from) +
              clipboardValue +
              code.slice(selection[0].to),
          },
          annotations:
            codeMirrorAnnotationMap[
              CodeMirrorEventAnnotation.ContextMenuAction
            ],
        });
        setCode(viewInstance.state.doc);
      }
    },
    [ContextMenuItemIds.Cut]: async (): Promise<void> => {
      if (!viewInstance) return;

      const selectedText = currentSelectedStrings
        ?.map((el) => el.label)
        .join('\n');
      if (selectedText) {
        await writeText(selectedText);
        internalClipboard.current = selectedText;
      }

      if (code && currentSelectedStrings) {
        currentSelectedStrings.map((el) => {
          const editorValue = viewInstance?.state.doc.toString();

          viewInstance.dispatch({
            changes: {
              from: 0,
              to: editorValue.length,
              insert: code.slice(0, el.from) + code.slice(el.to),
            },
            annotations:
              codeMirrorAnnotationMap[
                CodeMirrorEventAnnotation.ContextMenuAction
              ],
          });
          setCode(viewInstance.state.doc);
        });
      }
    },
    [ContextMenuItemIds.Undo]: (): void => {
      if (viewInstance) {
        undo({
          state: viewInstance.state,
          dispatch: viewInstance.dispatch,
        });
      }
    },
    [ContextMenuItemIds.Redo]: (): void => {
      if (viewInstance) {
        redo({
          state: viewInstance.state,
          dispatch: viewInstance.dispatch,
        });
      }
    },
    [ContextMenuItemIds.SelectAll]: (): void => {
      if (viewInstance) {
        selectAll({
          state: viewInstance.state,
          dispatch: viewInstance.dispatch,
        });
      }
    },
    [ContextMenuItemIds.CommentUncomment]: (): void => {
      if (viewInstance) {
        toggleComment({
          state: viewInstance.state,
          dispatch: viewInstance.dispatch,
        });
      }
    },
    [ContextMenuItemIds.IncreaseIndent]: (): void => {
      if (viewInstance) {
        indentMore({
          state: viewInstance.state,
          dispatch: viewInstance.dispatch,
        });
      }
    },
    [ContextMenuItemIds.DecreaseIndent]: (): void => {
      if (viewInstance) {
        indentLess({
          state: viewInstance.state,
          dispatch: viewInstance.dispatch,
        });
      }
    },
    [ContextMenuItemIds.Find]: (): void => {
      if (viewInstance) {
        openSearchPanel(viewInstance);
      }
    },
  };

  useEffect(() => {
    if (Config.APP_NAME !== 'App Lab') return;

    const handleNativeCopy = (): void => {
      const selected = window.getSelection()?.toString();
      if (selected) internalClipboard.current = selected;
    };

    const handleNativeCut = (): void => {
      const selected = window.getSelection()?.toString();
      if (selected) internalClipboard.current = selected;
    };

    document.addEventListener('copy', handleNativeCopy);
    document.addEventListener('cut', handleNativeCut);

    return () => {
      document.removeEventListener('copy', handleNativeCopy);
      document.removeEventListener('cut', handleNativeCut);
    };
  }, []);

  useEffect(() => {
    async function setKeys(): Promise<void> {
      //If the document is not focused and development console is open, an error will be thrown
      //To avoid this we prevent the function from getting called if the document is not focused and the mode is development
      if (!document.hasFocus() && Config.MODE === 'development') return;

      const keys: ContextMenuItemIds[] = [];
      if (Config.APP_NAME === 'App Lab') {
        // Sync internalClipboard from system clipboard when menu opens.
        // This ensures that if the user copied from another app, the internal clipboard
        // is updated before they paste. The clipboard service uses Wails native API
        // in desktop environment without triggering permission prompts.
        try {
          const systemClipboard = await readText();
          if (systemClipboard) {
            internalClipboard.current = systemClipboard;
          }
        } catch (error) {
          if (Config.MODE === 'development') {
            console.error('Failed to read system clipboard:', error);
          }
        }

        if (!internalClipboard.current) {
          keys.push(ContextMenuItemIds.Paste);
        }
      } else {
        try {
          const clipboardValue = await readText();
          if (!clipboardValue) keys.push(ContextMenuItemIds.Paste);
        } catch {
          keys.push(ContextMenuItemIds.Paste);
        }
      }
      setDisabledKeys(keys);
    }

    if (state.isOpen) {
      setKeys();
    }
  }, [state.isOpen]);

  const closeContextMenu = useCallback(() => {
    setControlledOpen(false);
    state.close();
  }, [state]);

  const onContextMenuOpen: EventListener = useCallback(
    (e: Event) => {
      if (!(e instanceof MouseEvent)) {
        return;
      }
      e.preventDefault();
      if (e.ctrlKey) {
        setControlledOpen(true);
      } else {
        state.open();
      }

      setClickPosition({
        clickPosX: e.clientX,
        clickPosY: e.clientY,
      });
    },
    [state],
  );

  const onContextMenuClose = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeContextMenu();
    },
    [closeContextMenu],
  );

  useClickAway(menuRef, closeContextMenu, ['click']);

  useEventListener('contextmenu', onContextMenuOpen, containerRef.current);
  useEventListener('keydown', onContextMenuClose);

  return {
    clickPosition,
    onContextMenuOpen,
    onContextMenuClose,
    containerRef,
    menuRef,
    menuProps,
    clickHandlers,
    disabledKeys,
    state: controlledOpen ? { ...state, isOpen: true } : state, // fix wrong behavior of react-stately useMenuTriggerState
  };
};
