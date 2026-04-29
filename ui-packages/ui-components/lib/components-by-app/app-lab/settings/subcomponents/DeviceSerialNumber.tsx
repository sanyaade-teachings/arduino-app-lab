import {
  AccountView,
  AccountViewCrossed,
} from '@cloud-editor-mono/images/assets/icons';
import { useMemo, useState } from 'react';

import {
  ButtonAppearance,
  ButtonSize,
  ButtonVariant,
} from '../../essential/button';
import { IconButton } from '../../essential/icon-button/IconButton';
import styles from '../settings.module.scss';

export interface DeviceSerialNumberProps {
  serial?: string;
}

export const DeviceSerialNumber = ({
  serial,
}: DeviceSerialNumberProps): JSX.Element => {
  const [mask, setMask] = useState(true);

  const masked = useMemo(() => {
    if (!serial) return '';
    return [serial.slice(0, 3), '****', serial.slice(-4)].join('');
  }, [serial]);

  return (
    <div className={styles['device-serial-number']}>
      {mask ? masked : serial}
      {serial && serial.length > 8 && (
        <IconButton
          Icon={mask ? AccountView : AccountViewCrossed}
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          appearance={ButtonAppearance.LowContrast}
          label="Toggle visibility"
          onClick={(): void => setMask((mask) => !mask)}
        />
      )}
    </div>
  );
};
