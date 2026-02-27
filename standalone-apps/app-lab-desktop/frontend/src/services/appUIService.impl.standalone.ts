import {
  AppUIService,
  getAppPorts,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';

import { ForwardNonUIPort, OpenUIWhenReady } from '../../wailsjs/go/app/App';

export const findUIPort: AppUIService['findUIPort'] = async function (
  appId: string,
): Promise<number> {
  const ports = await getAppPorts(appId);
  const webview = ports.find((p) => p.serviceName === 'webview');
  const port = webview?.port;
  if (!port) throw new Error(`Webview port not found for app ${appId}`);
  return parseInt(port, 10);
};

interface CompletePort {
  port: string;
  serviceName: string;
  source?: string | undefined;
}

export const findUIPorts: AppUIService['findUIPorts'] = async function (
  appId: string,
): Promise<number[]> {
  const ports = await getAppPorts(appId);

  const webviewPorts = ports.filter(
    (p): p is CompletePort => p.serviceName === 'webview' && !!p.port,
  );

  if (webviewPorts.length === 0)
    throw new Error(`Webview port not found for app ${appId}`);

  return webviewPorts.map((p) => parseInt(p.port, 10));
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
