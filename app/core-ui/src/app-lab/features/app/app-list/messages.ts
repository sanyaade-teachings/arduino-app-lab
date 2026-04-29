import { AppsSection } from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { defineMessages } from 'react-intl';

export const emptyTitleMessages = defineMessages<AppsSection>({
  'my-apps': {
    id: 'appList.emptyMyApps',
    defaultMessage: 'No apps yet',
    description: 'No apps yet',
  },
  examples: {
    id: 'appList.emptyExamples',
    defaultMessage: 'No examples found',
    description: 'No examples found',
  },
});

export const emptyDescriptionMessages = defineMessages<AppsSection>({
  'my-apps': {
    id: 'appList.emptyMyAppsDescription',
    defaultMessage:
      'Get started by creating a new one from scratch or using an example',
    description: 'No apps yet description',
  },
  examples: {
    id: 'appList.emptyExamplesDescription',
    defaultMessage:
      'There might be an issue with retrieving examples from the board',
    description: 'No examples found description',
  },
});

export const appListMessages = defineMessages({
  actionCreate: {
    id: 'appList.actionCreate',
    defaultMessage: 'Create new app',
    description: 'Create a new app',
  },
  createNewApp: {
    id: 'app-lab.app-list.create-new-app',
    defaultMessage: 'Create New App',
    description: 'Dropdown option to create a new app',
  },
  importApp: {
    id: 'app-lab.app-list.import-app',
    defaultMessage: 'Import App',
    description: 'Dropdown option to import an app',
  },
  successfullyDeletedApp: {
    id: 'app-lab.app-list.successfully-deleted-app',
    defaultMessage: 'App successfully deleted',
    description: 'Success message when an app is deleted',
  },
  successfullyRenamedApp: {
    id: 'app-lab.app-list.successfully-renamed-app',
    defaultMessage: 'App successfully renamed',
    description: 'Success message when an app is renamed',
  },
  successfullyExportedApp: {
    id: 'app-lab.app-list.successfully-exported-app',
    defaultMessage: '{appName} successfully exported',
    description: 'Success message when an app is exported',
  },
  setAsDefault: {
    id: 'app-lab.app-list.set-as-default',
    defaultMessage: '{appName} set as default app',
    description: 'Success message when an app is set as default',
  },
  removedAsDefault: {
    id: 'app-lab.app-list.removed-as-default',
    defaultMessage: '{appName} removed as default app',
    description: 'Success message when an app is removed as default',
  },
});
