import { ClipboardService } from './clipboard-service.type';

export let readText: ClipboardService['readText'] = function () {
  throw new Error('readText service not implemented');
};

export let writeText: ClipboardService['writeText'] = function () {
  throw new Error('writeText service not implemented');
};

export const setClipboardService = (service: ClipboardService): void => {
  readText = service.readText;
  writeText = service.writeText;
};
