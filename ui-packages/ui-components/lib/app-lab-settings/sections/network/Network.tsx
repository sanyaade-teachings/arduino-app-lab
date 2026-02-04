import { WifiOff, WifiOn } from '@cloud-editor-mono/images/assets/icons';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

import {
  AppLabDialog,
  Button,
  ButtonSize,
  ButtonType,
  UseNetworkLogic,
} from '../../../components-by-app/app-lab';
import Item from '../../item/Item';
import {
  NetworkCredentials,
  NetworkItem,
  SecurityProtocols,
} from '../../settings.type';
import styles from './network.module.scss';
import ConnectToNetwork from './sub-components/ConnectToNetwork';
import NetworksList from './sub-components/NetworksList';
import Scanning from './sub-components/Scanning';

interface NetworkProps {
  logic: ReturnType<UseNetworkLogic> & {
    onSkipNetworkSetup?: () => void;
    draftNetworkCredentials?: NetworkCredentials;
    setDraftNetworkCredentials?: (v: NetworkCredentials) => void;
  };
  isSetupFlow?: boolean;
  handleChange?: (value: {
    isValid: boolean;
    isLoading: boolean;
    isSuccess?: boolean;
  }) => void;
  classes?: { container?: string; button?: string };
}

const Network = forwardRef((props: NetworkProps, ref) => {
  const { logic, isSetupFlow, handleChange } = props;

  const {
    networkList,
    isScanning,
    scanNetworkList,
    connectToWifiNetwork,
    isConnected,
    isConnecting,
    connectRequestIsError,
    connectRequestIsSuccess,
    selectedNetwork,
    setSelectedNetwork,
    manualNetworkSetup,
    setManualNetworkSetup,
    onSkipNetworkSetup,
  } = logic;

  const initialCredentials: NetworkCredentials =
    logic.draftNetworkCredentials ?? {
      name: '',
      password: '',
      security: SecurityProtocols.WPA2,
    };

  const [networkCredentials, setNetworkCredentials] =
    useState<NetworkCredentials>(initialCredentials);

  const [skipModalOpen, setSkipModalOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    confirm: (): void => connectToWifiNetwork(networkCredentials),
    skip: (): void => setSkipModalOpen(true),
  }));

  useEffect(() => {
    if (isSetupFlow && handleChange) {
      handleChange({
        isValid: Boolean(networkCredentials.name) && !connectRequestIsError,
        isLoading: isConnecting || isScanning,
        isSuccess: isConnected,
      });
    }
  }, [
    networkCredentials,
    isSetupFlow,
    handleChange,
    selectedNetwork,
    connectRequestIsError,
    isConnecting,
    isScanning,
    isConnected,
  ]);

  const resetNetworkState = useCallback((): void => {
    setSelectedNetwork(undefined);
    setManualNetworkSetup(false);

    const next = {
      name: '',
      password: '',
      security: SecurityProtocols.WPA2,
    };

    setNetworkCredentials(next);
    logic.setDraftNetworkCredentials?.(next);

    scanNetworkList();
  }, [scanNetworkList, setManualNetworkSetup, setSelectedNetwork, logic]);

  const skipFooter = useMemo(
    () => (
      <>
        <Button
          type={ButtonType.Secondary}
          size={ButtonSize.Small}
          classes={{
            button: styles['skip-wifi-continue-button'],
          }}
          onClick={() => {
            setSkipModalOpen(false);
            onSkipNetworkSetup?.();
          }}
        >
          Continue Offline
        </Button>

        <Button
          type={ButtonType.Primary}
          size={ButtonSize.Small}
          onClick={() => setSkipModalOpen(false)}
        >
          Choose a Network
        </Button>
      </>
    ),
    [onSkipNetworkSetup],
  );

  return (
    <div className={styles['network']}>
      <AppLabDialog
        open={skipModalOpen}
        onOpenChange={setSkipModalOpen}
        title="Wi-Fi connection"
        footer={skipFooter}
      >
        <div className={styles['skip-modal-content']}>
          <h2 className={styles['skip-modal-title']}>
            {"Don't want to connect your board to a network?"}
          </h2>

          <p className={styles['skip-modal-subtitle']}>
            App Lab will still run, but some features won’t be available:
          </p>

          <ul className={styles['skip-modal-list']}>
            <li>Updates and downloads</li>
            <li>Sketch libraries</li>
            <li>Apps or Examples that requires internet connection</li>
            <li>Open External links (only in SBC mode)</li>{' '}
          </ul>
        </div>
      </AppLabDialog>

      {!isSetupFlow ? (
        <div className={styles['icon']}>
          {isScanning ? <WifiOff /> : <WifiOn />}
        </div>
      ) : null}

      {selectedNetwork || manualNetworkSetup ? (
        <ConnectToNetwork
          connectToWifiNetwork={connectToWifiNetwork}
          isConnected={isConnected}
          isConnecting={isConnecting}
          isError={connectRequestIsError}
          isSuccess={connectRequestIsSuccess}
          onChangeNetwork={resetNetworkState}
          manualNetworkSetup={manualNetworkSetup}
          isSetupFlow={isSetupFlow}
          networkCredentials={networkCredentials}
          onChangeCredentials={(credentials: NetworkCredentials): void => {
            setNetworkCredentials(credentials);
            logic.setDraftNetworkCredentials?.(credentials);
          }}
        />
      ) : (
        <>
          <Scanning
            networkList={networkList}
            isScanning={isScanning}
            scanNetworkList={scanNetworkList}
            onManualNetworkSetup={(): void => setManualNetworkSetup(true)}
          />
          {!isScanning ? (
            <NetworksList
              networkList={networkList}
              onSelectNetwork={(network: NetworkItem): void => {
                setSelectedNetwork(network);

                const next = {
                  ...networkCredentials,
                  name: network,
                };

                setNetworkCredentials(next);
                logic.setDraftNetworkCredentials?.(next);

                setManualNetworkSetup(false);
              }}
              onManualNetworkSetup={(): void => setManualNetworkSetup(true)}
            />
          ) : (
            [...Array(3)].map((_, index) => (
              <Item
                key={index}
                classes={{
                  container: styles['item-placeholder'],
                  content: styles['item-content'],
                  icon: styles['item-icon'],
                }}
              />
            ))
          )}
        </>
      )}
    </div>
  );
});

Network.displayName = 'Network';

export default Network;
