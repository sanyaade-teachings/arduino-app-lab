import clsx from 'clsx';

import {
  CONSOLE_SOURCE_KEYS,
  ConsoleSourceKey,
} from '../multipleConsolePanel.type';
import styles from './console-tabs.module.scss';
interface ConsoleTabProps {
  consoleTabs: ConsoleSourceKey[];
  activeTab: ConsoleSourceKey | undefined;
  setActiveTab: React.Dispatch<
    React.SetStateAction<ConsoleSourceKey | undefined>
  >;
}

const ConsoleTabs: React.FC<ConsoleTabProps> = (props: ConsoleTabProps) => {
  const { consoleTabs, activeTab, setActiveTab } = props;

  const tabDictionary = (tab: ConsoleSourceKey): string => {
    switch (tab) {
      case CONSOLE_SOURCE_KEYS.STARTUP:
        return 'App launch';
      case CONSOLE_SOURCE_KEYS.PYTHON:
        return 'Python';
      case CONSOLE_SOURCE_KEYS.SERIAL_MONITOR:
        return 'Serial Monitor';
      default:
        return tab;
    }
  };

  return (
    <div className={styles['container']}>
      {consoleTabs.map((tab) => (
        <button
          className={clsx(
            styles['tab'],
            activeTab === tab ? styles['active'] : '',
          )}
          key={tab}
          onClick={(): void => setActiveTab(tab)}
        >
          {tabDictionary(tab)}
        </button>
      ))}
    </div>
  );
};

export default ConsoleTabs;
