import { useCallback, useState } from 'react';

import { AppLabTabs } from '../../app-lab-tabs';
import styles from './markdown-editor-toolbar.module.scss';

interface MarkdownEditorToolbarProps {
  isRendered: boolean;
  onToggleRender: (rendered: boolean) => void;
  readOnly?: boolean;
}

const tabs = ['Write', 'Preview'] as const;

const MarkdownEditorToolbar: React.FC<MarkdownEditorToolbarProps> = (
  props: MarkdownEditorToolbarProps,
) => {
  const { isRendered, onToggleRender, readOnly } = props;
  const [activeTab, setTab] = useState<typeof tabs[number]>(
    isRendered ? 'Preview' : 'Write',
  );

  const setTabAndToggleRender = useCallback(
    (tab: typeof tabs[number]): void => {
      setTab(tab);
      onToggleRender(tab === 'Preview');
    },
    [onToggleRender],
  );

  const appLabTabsLogic = useCallback(
    () => ({
      tabs,
      setTab: setTabAndToggleRender,
      activeTab,
    }),
    [activeTab, setTabAndToggleRender],
  );

  return (
    <div className={styles.container}>
      {!readOnly && <AppLabTabs appLabTabsLogic={appLabTabsLogic} />}
    </div>
  );
};

export default MarkdownEditorToolbar;
