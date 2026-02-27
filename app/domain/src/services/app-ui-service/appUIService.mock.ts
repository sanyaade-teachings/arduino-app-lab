import { AppUIService } from './app-ui-service.type';

export const MockAppUIService: AppUIService = {
  findUIPort: async (appId: string): Promise<number> => {
    console.info('[MockAppUIService] findUIPort called', { appId });
    return 3000;
  },

  findUIPorts: async (appId: string): Promise<number[]> => {
    console.info('[MockAppUIService] findUIPorts called', { appId });
    return [3000];
  },

  openUIWhenReady: async (port: number): Promise<void> => {
    console.info('[MockAppUIService] openUIWhenReady called', { port });
    if (typeof window !== 'undefined') {
      const url = `http://localhost:${port}`;
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch {
        // something
      }
    }
  },

  forwardNonUIPort: async (port: number): Promise<void> => {
    console.info('[MockAppUIService] forwardNonUIPort called', { port });
    return;
  },
};
