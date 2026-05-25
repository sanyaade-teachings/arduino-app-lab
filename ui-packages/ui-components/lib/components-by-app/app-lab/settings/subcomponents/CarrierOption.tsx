import {
  MediaCamera,
  MediaDisplay,
  Sort,
} from '@cloud-editor-mono/images/assets/icons';
import { useMemo } from 'react';

import { DropdownMenuButton } from '../../../../essential/dropdown-menu';
import { useI18n, XXSmall } from '../../../shared';
import { Info } from '../../settings-section/subcomponents/Info';
import { Row } from '../../settings-section/subcomponents/Row';
import { CarrierDevice, CarriersStatus } from '../../setup';
import { carrierMessages } from '../messages';
import styles from '../settings.module.scss';

export interface DeviceHeaderProps {
  carrierName: string;
  device: CarrierDevice;
  status: CarriersStatus;
  onChange: (carrierName: string, device: string, option: string) => void;
}

export const CarrierOption = ({
  carrierName,
  device,
  status,
  onChange,
}: DeviceHeaderProps): JSX.Element => {
  const { formatMessage } = useI18n();

  const icon = useMemo(() => {
    switch (device.deviceType) {
      case 'camera':
        return <MediaCamera />;
      case 'display':
        return <MediaDisplay />;
      default:
        return null;
    }
  }, [device.deviceType]);

  const value = useMemo(
    () =>
      status.carriers
        .find((carrier) => carrier.carrierName === carrierName)
        ?.next.find((media) => media.device === device.name)?.option,
    [carrierName, status.carriers, device.name],
  );

  return (
    <Row
      classes={{ value: styles['carrier-value'] }}
      label={
        <div className={styles['carrier-label']}>
          {icon}
          <XXSmall>{device.name}</XXSmall>
        </div>
      }
    >
      <DropdownMenuButton
        sections={[
          {
            name: 'Actions',
            items: device.availableDevices.map((option) => ({
              id: option,
              label: option,
            })),
          },
        ]}
        buttonChildren={
          <>
            {value}
            <Sort />
          </>
        }
        useStaticPosition={false}
        onAction={(key): void =>
          onChange(carrierName, device.name, key as string)
        }
        classes={{
          dropdownMenu: styles['dropdown-menu'],
          dropdownMenuButton: styles['dropdown-menu-button'],
          dropdownMenuButtonOpen: styles['dropdown-menu-button-open'],
          dropdownMenuButtonWrapper: styles['dropdown-menu-button-wrapper'],
          dropdownMenuPopover: styles['dropdown-menu-popover'],
        }}
      />
      {device.deviceType === 'display' && value !== 'none' && (
        <Info>{formatMessage(carrierMessages.carrierTooltip)}</Info>
      )}
    </Row>
  );
};
