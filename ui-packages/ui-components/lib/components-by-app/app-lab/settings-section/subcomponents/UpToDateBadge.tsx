import { Success } from '@cloud-editor-mono/images/assets/icons';
import clsx from 'clsx';

import { Badge, BadgeStyle, BadgeVariant } from '../../essential/badge';
import styles from '../settings-section.module.scss';

export interface UpToDateBadgeProps {
  className?: string;
  label: string;
}

export const UpToDateBadge = ({
  className,
  label,
}: UpToDateBadgeProps): JSX.Element => {
  return (
    <Badge
      icon={<Success />}
      style={BadgeStyle.Light}
      variant={BadgeVariant.Positive}
      uppercase={false}
      classes={{
        container: clsx(styles['settings-section-uptodate-badge'], className),
      }}
    >
      {label}
    </Badge>
  );
};
