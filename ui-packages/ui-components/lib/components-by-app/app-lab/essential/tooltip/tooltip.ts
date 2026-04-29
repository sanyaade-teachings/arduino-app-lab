import clsx from 'clsx';

import { useTooltip as useEssentialTooltip } from '../../../../tooltip';
import styles from './tooltip.module.scss';

export const useTooltip = (
  params: Parameters<typeof useEssentialTooltip>[0],
): ReturnType<typeof useEssentialTooltip> => {
  const tooltip = useEssentialTooltip(params);

  return {
    ...tooltip,
    renderTooltip: (className?: string) =>
      tooltip.renderTooltip(clsx(styles.tooltip, className)),
  };
};
