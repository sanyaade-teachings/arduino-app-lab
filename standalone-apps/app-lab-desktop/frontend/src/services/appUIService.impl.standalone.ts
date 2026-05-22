import {
  AppUIService,
  ForwardPort,
  getAppPorts,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';

import { ForwardNonUIPort, OpenUIWhenReady } from '../../wailsjs/go/app/App';

interface CompletePort {
  port: string;
  serviceName: string;
  source?: string | undefined;
}

export const findPorts: AppUIService['findPorts'] = async function (
  appId: string,
): Promise<ForwardPort[]> {
  const res = await getAppPorts(appId);
  return res
    .filter((p): p is CompletePort => !!p.port)
    .map((p) => ({
      port: parseInt(p.port, 10),
      type: p.serviceName === 'webview' ? 'webview' : 'other',
    }));
};

export const openUIWhenReady: AppUIService['openUIWhenReady'] = async function (
  port: number,
  timeout: number,
): Promise<void> {
  return OpenUIWhenReady(port, timeout);
};

export const forwardNonUIPort: AppUIService['forwardNonUIPort'] =
  async function (port: number): Promise<void> {
    return ForwardNonUIPort(port);
  };
