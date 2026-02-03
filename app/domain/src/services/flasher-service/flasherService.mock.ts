import { OSImageRelease } from './flasher-service.type';

const mockOSVersions: OSImageRelease[] = [
  {
    id: '1.1.0',
    version_label: 'Version 1.1.0',
    latest: true,
  },
  {
    id: '1.0.0',
    version_label: 'Version 1.0.0',
    latest: false,
  },
];

export const mockGetOSVersions = (): OSImageRelease[] => {
  // Not implemented yet, just return an empty array
  return [...mockOSVersions];
};
