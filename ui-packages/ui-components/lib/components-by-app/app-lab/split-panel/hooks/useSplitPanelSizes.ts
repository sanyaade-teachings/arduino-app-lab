import { useCallback, useEffect, useRef, useState } from 'react';

import { useSplitPanelStoredSizes } from './useSplitPanelStoredSizes';

export type UseSplitPanelSizes = (params: {
  containerRef: React.RefObject<HTMLElement>;
  storageKey?: string;
  initialSizes?: number[];
  collapsablePanelIndex?: 0 | 1;
  collapsedSizePx?: number;
  minSizePx?: number;
  collapseThresholdPx?: number;
  maximizedThresholdPx?: number;
  direction?: 'horizontal' | 'vertical';
}) => {
  sizes: number[];
  onDragStart: () => void;
  onDrag: (newSizes: number[]) => void;
  onDragEnd: (newSizes: number[]) => void;
  isCollapsed: boolean;
  isMaximized: boolean;
  toggleCollapsed: () => void;
  toggleMaximize: () => void;
  minimize: () => void;
};

export const useSplitPanelSizes: UseSplitPanelSizes = (params) => {
  const {
    containerRef,
    storageKey,
    initialSizes = [50, 50],
    collapsablePanelIndex = 0,
    minSizePx = 100,
    collapsedSizePx = 48,
    collapseThresholdPx = 20,
    maximizedThresholdPx = 20,
    direction = 'horizontal',
  } = params;

  const [storedSizes, setStoredSizes] = useSplitPanelStoredSizes(storageKey);
  const [sizes, setSizes] = useState<number[]>(storedSizes || initialSizes);
  const lastSizeBeforeToggle = useRef<number | null>(null);

  // Sync state when storage loads
  useEffect(() => {
    if (storedSizes) {
      setSizes(storedSizes);
    }
  }, [storedSizes]);

  const getMeasurements = useCallback(() => {
    const containerPx = !containerRef.current
      ? 0
      : direction === 'horizontal'
      ? containerRef.current.offsetWidth
      : containerRef.current.offsetHeight;

    return {
      containerPx,
      pxToPct: (px: number): number =>
        containerPx > 0 ? (px / containerPx) * 100 : 0,
    };
  }, [containerRef, direction]);

  const { containerPx } = getMeasurements();

  const currentCollapsablePanelPx =
    (sizes[collapsablePanelIndex] / 100) * containerPx;

  const isCollapsed =
    currentCollapsablePanelPx < collapsedSizePx + collapseThresholdPx;
  const isMaximized =
    currentCollapsablePanelPx > containerPx - maximizedThresholdPx;

  const onDragStart = useCallback(() => {
    lastSizeBeforeToggle.current = null;
  }, []);

  const onDrag = useCallback((newSizes: number[]) => {
    setSizes(newSizes);
  }, []);

  const applySizes = useCallback(
    (primaryPct: number) => {
      const finalSizes =
        collapsablePanelIndex === 0
          ? [primaryPct, 100 - primaryPct]
          : [100 - primaryPct, primaryPct];
      setSizes(finalSizes);
      setStoredSizes(finalSizes);
    },
    [collapsablePanelIndex, setStoredSizes],
  );

  const onDragEnd = useCallback(
    (newSizes: number[]) => {
      const { containerPx: currentContainerPx, pxToPct } = getMeasurements();
      if (currentContainerPx === 0) return;

      const panelPct = newSizes[collapsablePanelIndex];
      const panelPx = (panelPct / 100) * currentContainerPx;

      const minOpenPct = pxToPct(minSizePx);
      const collapsedPctCurrent = pxToPct(collapsedSizePx);

      let finalPPct = panelPct;
      if (panelPx < collapsedSizePx + collapseThresholdPx) {
        finalPPct = collapsedPctCurrent;
      } else if (panelPx < minSizePx) {
        finalPPct = minOpenPct;
      }

      applySizes(finalPPct);
    },
    [
      getMeasurements,
      collapsablePanelIndex,
      minSizePx,
      collapsedSizePx,
      collapseThresholdPx,
      applySizes,
    ],
  );

  const trySaveLastSizeBeforeToggle = useCallback(() => {
    if (lastSizeBeforeToggle.current !== null || isCollapsed || isMaximized) {
      // Don't overwrite last size if already set, only overwritten on drag start
      // This avoids losing the original size if user toggles collapse/maximize multiple times
      return;
    }

    const { containerPx: currentContainerPx, pxToPct } = getMeasurements();
    const currentSizePx =
      (sizes[collapsablePanelIndex] / 100) * currentContainerPx;
    const minSizePct = pxToPct(minSizePx);
    lastSizeBeforeToggle.current =
      currentSizePx < minSizePx ? minSizePct : sizes[collapsablePanelIndex];
  }, [
    getMeasurements,
    sizes,
    collapsablePanelIndex,
    minSizePx,
    isCollapsed,
    isMaximized,
  ]);

  const toggleCollapsed = useCallback(() => {
    trySaveLastSizeBeforeToggle();

    const { pxToPct } = getMeasurements();
    const targetPct = isCollapsed
      ? lastSizeBeforeToggle.current || pxToPct(minSizePx)
      : pxToPct(collapsedSizePx);
    applySizes(targetPct);
  }, [
    trySaveLastSizeBeforeToggle,
    getMeasurements,
    isCollapsed,
    minSizePx,
    collapsedSizePx,
    applySizes,
  ]);

  const toggleMaximize = useCallback(() => {
    trySaveLastSizeBeforeToggle();

    const { pxToPct } = getMeasurements();
    const targetPct = isMaximized
      ? lastSizeBeforeToggle.current || pxToPct(minSizePx)
      : 100;
    applySizes(targetPct);
  }, [
    trySaveLastSizeBeforeToggle,
    getMeasurements,
    isMaximized,
    minSizePx,
    applySizes,
  ]);

  const minimize = useCallback(() => {
    const { pxToPct } = getMeasurements();
    if (pxToPct(minSizePx) >= sizes[collapsablePanelIndex]) {
      return;
    }
    const targetPct = pxToPct(minSizePx);
    applySizes(targetPct);
    // Reset last size since user explicitly chose to minimize
    lastSizeBeforeToggle.current = null;
  }, [applySizes, collapsablePanelIndex, getMeasurements, minSizePx, sizes]);

  // Force minSizePx when browser window is resized
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newContainerPx =
          direction === 'horizontal'
            ? entry.contentRect.width
            : entry.contentRect.height;

        if (newContainerPx === 0) {
          continue;
        }

        setSizes((prevSizes) => {
          const currentPct = prevSizes[collapsablePanelIndex];
          const currentPx = (currentPct / 100) * newContainerPx;

          // Note, we can't use isCollapsed from react state due to timing of ResizeObserver callback
          const currentIsCollapsed = currentPx <= collapsedSizePx + 5;

          if (!currentIsCollapsed && currentPx < minSizePx) {
            const minPct = (minSizePx / newContainerPx) * 100;

            // Note that we don't want to update the store here
            // I's a response to container resize not a user-initiated split resize
            return collapsablePanelIndex === 0
              ? [minPct, 100 - minPct]
              : [100 - minPct, minPct];
          }

          return prevSizes;
        });
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [
    containerRef,
    direction,
    collapsablePanelIndex,
    collapsedSizePx,
    minSizePx,
    isCollapsed,
  ]);

  return {
    sizes,
    onDragStart,
    onDrag,
    onDragEnd,
    isCollapsed,
    isMaximized,
    toggleCollapsed,
    toggleMaximize,
    minimize,
  };
};
