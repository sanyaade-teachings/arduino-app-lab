import { FeatureFlagService } from './featureFlagsService.type';

export let getFeatureFlags: FeatureFlagService['getFeatureFlags'] =
  function () {
    throw new Error('getFeatureFlags service not implemented');
  };

const flags: string[] = [];

export const setFeatureFlagService = async (
  service: Omit<FeatureFlagService, 'getFeatureFlagsSync' | 'isFFEnabled'>,
): Promise<void> => {
  getFeatureFlags = service.getFeatureFlags;

  try {
    const fetchedFlags = await getFeatureFlags();
    fetchedFlags.forEach((flag) => {
      flags.push(flag);
    });
  } catch (error) {
    console.error('Error fetching feature flags:', error);
  }
};

export const getFeatureFlagsSync: FeatureFlagService['getFeatureFlagsSync'] =
  function () {
    return flags;
  };

export const isFFEnabled: FeatureFlagService['isFFEnabled'] = function (ff) {
  return flags.includes(ff);
};
