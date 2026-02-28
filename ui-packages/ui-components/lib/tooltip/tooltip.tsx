import clsx from 'clsx';
import { uniqueId } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { XXSmall } from '../typography';
import styles from './tooltip.module.scss';

interface UseTooltipParams {
  content: React.ReactNode;
  title?: string;
  timeout?: number;
  triggerType?: 'hover' | 'click';
  tooltipType?: 'title' | 'tooltip';
  renderDelay?: number;
  direction?: 'down' | 'up' | 'right' | 'up-right';
}

type UseTooltip = (params: UseTooltipParams) => {
  props: {
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onPress?: () => void;
    'aria-describedby': string | undefined;
    ref?: React.RefObject<HTMLDivElement>;
  };
  renderTooltip: (className?: string) => JSX.Element | null;
  isTooltipVisible: boolean;
  setShowTooltip: (show: boolean) => void;
};

export const useTooltip: UseTooltip = ({
  content,
  title,
  timeout = 1000,
  renderDelay = 0,
  tooltipType = 'tooltip',
  triggerType = 'hover',
  direction = 'down',
}: UseTooltipParams) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const tooltipTimeoutId = useRef<number | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [id, setId] = useState<string>();

  useEffect(() => {
    setId(`tooltip-${uniqueId()}`);
  }, []);

  const updatePosition = useCallback(() => {
    if (triggerRef.current && direction === 'up-right') {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 12,
        left: rect.left,
      });
    }
  }, [direction]);

  const handleClick = useCallback(() => {
    if (tooltipTimeoutId.current) {
      window.clearTimeout(tooltipTimeoutId.current);
    }
    updatePosition();
    setShowTooltip(true);
    tooltipTimeoutId.current = window.setTimeout(() => {
      setShowTooltip(false);
    }, timeout);
  }, [timeout, updatePosition]);

  const handleMouseEnter = useCallback(() => {
    if (tooltipTimeoutId.current) {
      window.clearTimeout(tooltipTimeoutId.current);
    }

    tooltipTimeoutId.current = window.setTimeout(() => {
      updatePosition();
      setShowTooltip(true);
    }, renderDelay);
  }, [renderDelay, updatePosition]);

  const handleMouseLeave = useCallback(() => {
    if (tooltipTimeoutId.current) {
      window.clearTimeout(tooltipTimeoutId.current);
    }

    tooltipTimeoutId.current = window.setTimeout(() => {
      setShowTooltip(false);
    }, timeout);
  }, [timeout]);

  const renderTooltip = useCallback(
    (className: string | undefined) => {
      const usePortal = direction === 'up-right';

      const tooltipContent = (
        <div
          role="tooltip"
          id={id}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={clsx(
            styles['tooltip'],
            showTooltip && styles['tooltip-show'],
            tooltipType === 'title' && styles['tooltip--title'],
            direction === 'up' && styles['tooltip-up'],
            direction === 'up-right' && styles['tooltip-up-right'],
            className,
          )}
          style={
            usePortal && position
              ? {
                  position: 'fixed',
                  top: position.top,
                  left: position.left,
                  transform: 'translateY(-100%)',
                }
              : undefined
          }
        >
          {title && (
            <div className={styles['tooltip-title']}>
              <XXSmall bold>{title}</XXSmall>
            </div>
          )}
          <XXSmall>{content}</XXSmall>
        </div>
      );

      if (usePortal) {
        return createPortal(tooltipContent, document.body);
      }

      return tooltipContent;
    },
    [
      content,
      direction,
      handleMouseEnter,
      handleMouseLeave,
      id,
      position,
      showTooltip,
      title,
      tooltipType,
    ],
  );

  return {
    props: {
      ...(triggerType === 'hover' && {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      }),
      ...(triggerType === 'click' && {
        onPress: handleClick,
      }),
      'aria-describedby': id,
      ref: triggerRef,
    },
    renderTooltip,
    setShowTooltip,
    isTooltipVisible: showTooltip,
  };
};
