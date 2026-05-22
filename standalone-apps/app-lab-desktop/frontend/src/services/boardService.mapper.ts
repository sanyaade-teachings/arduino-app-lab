import {
  Board,
  Carrier,
  CarrierDeviceType,
  CarriersStatus,
  ConnectionType,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';

import { board, carrier } from '../../wailsjs/go/models';

function mapProtocol(protocol: string): ConnectionType {
  switch (protocol) {
    case 'serial':
      return 'USB';
    case 'network':
      return 'Network';
    case 'local':
      return 'Local';
    default:
      throw new Error('Unknown protocol');
  }
}

function mapBoard(board: board.Board): Board {
  return {
    id: board.id,
    type: board.info.BoardName,
    name: board.info.CustomName,
    fqbn: board.info.FQBN,
    connectionType: mapProtocol(board.info.Protocol),
    protocol: board.info.Protocol,
    serial: board.info.Serial,
    address: board.info.Address,
  };
}

export function mapGetBoards(boards: board.Board[]): Board[] {
  return boards.map(mapBoard);
}

export function mapCarrier(carrier: carrier.Carrier): Carrier {
  return {
    name: carrier.name,
    devices: carrier.devices.map((device) => ({
      name: device.name,
      deviceType: device.device_type as CarrierDeviceType,
      availableDevices: device.available_devices,
    })),
  };
}

export function mapCarriersStatus(
  carriersStatus: carrier.ShowResult,
): CarriersStatus {
  return {
    carriers: carriersStatus.carriers.map((carrier) => ({
      carrierName: carrier.carrier_name,
      current: carrier.current.map((device) => ({
        device: device.device,
        option: device.option,
        deviceType: device.device_type as CarrierDeviceType,
      })),
      currentEnabled: carrier.current_enabled,
      next: carrier.next.map((device) => ({
        device: device.device,
        option: device.option,
        deviceType: device.device_type as CarrierDeviceType,
      })),
      nextEnabled: carrier.next_enabled,
    })),
  };
}
