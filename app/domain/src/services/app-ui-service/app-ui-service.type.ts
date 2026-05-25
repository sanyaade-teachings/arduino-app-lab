export interface ForwardPort {
  port: number;
  type: 'webview' | 'other';
}

export interface AppUIService {
  findPorts: (appId: string) => Promise<ForwardPort[]>;
  openUIWhenReady: (port: number, timeout: number) => Promise<void>;
  forwardNonUIPort: (port: number) => Promise<void>;
}
