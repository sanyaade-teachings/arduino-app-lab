import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';

import styles from './app-lab-tabs.module.scss';

export type AppLabTabsLogic<T extends string> = () => {
  tabs: readonly T[];
  setTab: (tab: T) => void;
  activeTab: T;
};

interface AppLabTabsProps<T extends string> {
  appLabTabsLogic: AppLabTabsLogic<T>;
  classes?: {
    container?: string;
    tab?: string;
  };
  size?: 'small' | 'default';
}

const AppLabTabs = <T extends string>(
  props: AppLabTabsProps<T>,
): React.ReactElement => {
  const { appLabTabsLogic, classes, size = 'default' } = props;
  const { tabs, setTab, activeTab } = appLabTabsLogic();

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Set tabs to same width (of the largest one)
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const tabs = container.querySelectorAll<HTMLButtonElement>('button');
    let maxWidth = 0;

    tabs.forEach((tab) => {
      const width = tab.offsetWidth;
      if (width > maxWidth) maxWidth = width;
    });
    tabs.forEach((tab) => {
      tab.style.width = `${maxWidth}px`;
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={clsx(styles['container'], classes?.container, {
        [styles['default']]: size === 'default',
        [styles['small']]: size === 'small',
      })}
    >
      {tabs &&
        tabs.map((tab) => (
          <button
            key={tab}
            onClick={(): void => setTab(tab)}
            className={clsx(
              styles['tab'],
              {
                [styles['active']]: activeTab === tab,
              },
              classes?.tab,
            )}
          >
            {tab}
          </button>
        ))}
    </div>
  );
};

export default AppLabTabs;
