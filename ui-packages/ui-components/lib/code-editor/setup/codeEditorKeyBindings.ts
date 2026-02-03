import { indentLess, indentMore } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { KeyBinding } from '@codemirror/view';

export const tabKeyBinding: KeyBinding = {
  key: 'Tab',
  run: ({ state, dispatch }): boolean => {
    if (state.readOnly) {
      return true;
    }
    if (state.selection.ranges.some((r) => !r.empty))
      return indentMore({ state, dispatch });
    dispatch(
      state.update(state.replaceSelection(state.facet(indentUnit)), {
        scrollIntoView: true,
        userEvent: 'input',
      }),
    );
    return true;
  },
  shift: ({ state, dispatch }) => {
    if (state.readOnly) {
      return true;
    }
    return indentLess({ state, dispatch });
  },
};
