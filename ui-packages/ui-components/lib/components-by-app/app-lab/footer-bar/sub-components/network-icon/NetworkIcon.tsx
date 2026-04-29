import {
  World,
  WorldDisconnected,
} from '@cloud-editor-mono/images/assets/icons';

import { IconButton } from '../../../../../essential/icon-button';
import { useTooltip } from '../../../../../tooltip';
import { SystemResource } from '../../FooterBar.type';
import styles from './network-icon.module.scss';

interface NetworkIconProps {
  networkItem: SystemResource | undefined;
}

export const NetworkIcon: React.FC<NetworkIconProps> = ({
  networkItem,
}: NetworkIconProps) => {
  const { props: tooltipProps, renderTooltip } = useTooltip({
    content: networkItem?.label ?? 'No internet connection',
    direction: 'up',
    timeout: 0,
  });

  return (
    <div {...tooltipProps}>
      <IconButton
        classes={{
          button: styles['network-icon'],
        }}
        label={networkItem?.label || ''}
        Icon={networkItem?.state === 'default' ? World : WorldDisconnected}
        onPress={networkItem?.onClick}
      />
      {renderTooltip(styles['tooltip-content'])}
    </div>
  );
};
