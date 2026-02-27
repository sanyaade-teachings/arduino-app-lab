import { AppUIService } from './app-ui-service.type';

export let findUIPort: AppUIService['findUIPort'] = async function () {
  throw new Error('findUIPort not implemented');
};

export let findUIPorts: AppUIService['findUIPorts'] = async function () {
  throw new Error('findUIPorts not implemented');
};

export let openUIWhenReady: AppUIService['openUIWhenReady'] =
  async function () {
    throw new Error('openUIWhenReady not implemented');
  };

export let forwardNonUIPort: AppUIService['forwardNonUIPort'] =
  async function () {
    throw new Error('forwardNonUIPort not implemented');
  };

export const setAppUIService = (service: AppUIService): void => {
  findUIPort = service.findUIPort;
  findUIPorts = service.findUIPorts;
  openUIWhenReady = service.openUIWhenReady;
  forwardNonUIPort = service.forwardNonUIPort;
};
