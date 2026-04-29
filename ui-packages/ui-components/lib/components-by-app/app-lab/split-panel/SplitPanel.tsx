import clsx from 'clsx';
import React from 'react';
import Split from 'react-split';

import { useSplitPanelSizes } from './hooks/useSplitPanelSizes';
import styles from './split-panel.module.scss';

export type SlitPanelAPI = {
  isCollapsed: boolean;
  isMaximized: boolean;
  toggleCollapsed: () => void;
  toggleMaximize: () => void;
  minimize: () => void;
};

export type SplitPanelProps = {
  children: React.ReactNode | ((api: SlitPanelAPI) => JSX.Element[]);
  storageKey?: string;
  initialSizes?: number[];
  collapsablePanelIndex?: 0 | 1;
  collapsedSizePx?: number;
  minSizePx?: number;
  collapseThresholdPx?: number;
  maximizedThresholdPx?: number;
  direction?: 'horizontal' | 'vertical';
  classes: {
    container: string;
    split?: string;
    gutter?: string;
  };
  isCollapsable?: boolean;
};

export const SplitPanel: React.FC<SplitPanelProps> = (
  props: SplitPanelProps,
) => {
  const {
    children,
    storageKey,
    initialSizes = [50, 50],
    collapsablePanelIndex = 0,
    collapsedSizePx = 48,
    minSizePx = 100,
    collapseThresholdPx = 20,
    maximizedThresholdPx = 20,
    direction = 'horizontal',
    isCollapsable = true,
    classes,
  } = props;

  const containerRef = React.useRef<HTMLDivElement>(null);

  const {
    sizes,
    onDrag,
    onDragStart,
    onDragEnd,
    isCollapsed,
    isMaximized,
    toggleCollapsed,
    toggleMaximize,
    minimize,
  } = useSplitPanelSizes({
    containerRef,
    storageKey,
    initialSizes,
    collapsablePanelIndex,
    collapsedSizePx,
    minSizePx,
    collapseThresholdPx,
    maximizedThresholdPx,
    direction,
  });

  return (
    <div
      className={clsx(styles['split-container'], classes.container)}
      ref={containerRef}
    >
      <Split
        className={clsx(styles['split'], styles[direction], classes.split)}
        sizes={sizes}
        minSize={isCollapsable ? collapsedSizePx : minSizePx}
        snapOffset={isCollapsable ? collapseThresholdPx : 0}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        gutterAlign="center"
        direction={direction}
        cursor={direction === 'horizontal' ? 'col-resize' : 'row-resize'}
        gutterSize={1}
        gutter={(): HTMLElement => {
          const gutterDirectionClass =
            direction === 'horizontal'
              ? styles['gutter-vertical']
              : styles['gutter-horizontal'];
          const element = document.createElement('div');
          element.className = clsx(
            styles['gutter'],
            gutterDirectionClass,
            classes.gutter,
          );
          return element;
        }}
      >
        {typeof children === 'function'
          ? children({
              isCollapsed,
              isMaximized,
              toggleCollapsed,
              toggleMaximize,
              minimize,
            })
          : children}
      </Split>
    </div>
  );
};
