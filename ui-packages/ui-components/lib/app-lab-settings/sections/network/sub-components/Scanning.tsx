import { ChevronRight } from '@bcmi-labs/cloud-editor-images/assets/icons';

import {
  Button,
  ButtonSize,
  ButtonType,
  IconButton,
  Small,
} from '../../../../components-by-app/app-lab';
import { ProgressBar } from '../../../../essential/progress-bar';
import { useI18n } from '../../../../i18n/useI18n';
import { XSmall, XXSmall } from '../../../../typography';
import { networkMessages } from '../../../messages';
import { NetworkItem } from '../../../settings.type';
import styles from './scanning.module.scss';

interface ScanningProps {
  networkList: NetworkItem[];
  isScanning: boolean;
  scanNetworkList: () => void;
  onManualNetworkSetup: () => void;
}

const Scanning: React.FC<ScanningProps> = (props: ScanningProps) => {
  const { networkList, isScanning, scanNetworkList, onManualNetworkSetup } =
    props;

  const { formatMessage } = useI18n();

  return (
    <div className={styles['scanning']}>
      <div className={styles['content']}>
        {networkList?.length === 0 && !isScanning ? (
          <XSmall>{formatMessage(networkMessages.noAvailableNetworks)}</XSmall>
        ) : (
          <Small className={styles['title']}>
            {formatMessage(networkMessages.scanningForNetworks)}
            <XXSmall>{formatMessage(networkMessages.chooseNetwork)}</XXSmall>
          </Small>
        )}
        <Button
          type={ButtonType.Tertiary}
          size={ButtonSize.XSmall}
          onClick={scanNetworkList}
          disabled={isScanning}
        >
          {formatMessage(networkMessages.scanAgain)}
        </Button>
      </div>
      {isScanning ? (
        <>
          <ProgressBar
            active={isScanning}
            classes={{ progressBar: styles['progress-bar'] }}
          />
          <IconButton
            Icon={ChevronRight}
            classes={{ button: styles['add-network'] }}
            onPress={onManualNetworkSetup}
            label={''}
          >
            <div>{formatMessage(networkMessages.addNetworkManually)}</div>
          </IconButton>
        </>
      ) : null}
    </div>
  );
};

export default Scanning;
