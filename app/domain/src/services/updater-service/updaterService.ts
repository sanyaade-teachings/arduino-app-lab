import {
  getMandatoryUpdatesListRequest,
  getReleaseImageUrl,
  getReleaseNotesRequest,
  MandatoryUpdateList,
} from '@cloud-editor-mono/infrastructure';

import { UpdaterService } from './updaterService.type';

export let newVersion: UpdaterService['newVersion'];
export let getCurrentVersion: UpdaterService['getCurrentVersion'];
export let checkAndApplyUpdate: UpdaterService['checkAndApplyUpdate'];
export let checkBoardUpdateWailsFallback: UpdaterService['checkBoardUpdateWailsFallback'];
export let applyBoardUpdateWailsFallback: UpdaterService['applyBoardUpdateWailsFallback'];
export let getBoardUpdateLogsWailsFallback: UpdaterService['getBoardUpdateLogsWailsFallback'];

export let getMandatoryUpdatesList: () => Promise<MandatoryUpdateList> = () => {
  return getMandatoryUpdatesListRequest();
};
export let getReleaseImageSrc: (tag: string) => string = (tag: string) => {
  return getReleaseImageUrl(tag);
};
export let getReleaseNotes: (tag: string) => Promise<string> = (
  tag: string,
) => {
  return getReleaseNotesRequest(tag);
};

export const setUpdaterService = (service: UpdaterService): void => {
  newVersion = service.newVersion;
  getCurrentVersion = service.getCurrentVersion;
  checkAndApplyUpdate = service.checkAndApplyUpdate;
  checkBoardUpdateWailsFallback = service.checkBoardUpdateWailsFallback;
  applyBoardUpdateWailsFallback = service.applyBoardUpdateWailsFallback;
  getBoardUpdateLogsWailsFallback = service.getBoardUpdateLogsWailsFallback;
  if (service.getMandatoryUpdatesList) {
    getMandatoryUpdatesList = service.getMandatoryUpdatesList;
  }
  if (service.getReleaseNotes) {
    getReleaseNotes = service.getReleaseNotes;
  }
  if (service.getReleaseImageSrc) {
    getReleaseImageSrc = service.getReleaseImageSrc;
  }
};
