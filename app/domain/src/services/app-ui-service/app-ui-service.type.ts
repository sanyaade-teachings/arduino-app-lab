export interface AppUIService {
  findUIPort: (appId: string) => Promise<number>;
  findUIPorts: (appId: string) => Promise<number[]>;
  openUIWhenReady: (port: number, timeout: number) => Promise<void>;
  forwardNonUIPort: (port: number) => Promise<void>;
}
