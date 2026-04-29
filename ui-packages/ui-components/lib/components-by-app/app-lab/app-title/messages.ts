import { defineMessages } from 'react-intl';

export const appTitleMessages = defineMessages({
  actionRename: {
    id: 'appTitle.actionRename',
    defaultMessage: 'Rename',
    description: 'Rename the app',
  },
  actionDuplicate: {
    id: 'appTitle.actionDuplicate',
    defaultMessage: 'Duplicate',
    description: 'Duplicate the app',
  },
  actionExport: {
    id: 'appTitle.actionExport',
    defaultMessage: 'Export App',
    description: 'Export the app',
  },
  actionDelete: {
    id: 'appTitle.actionDelete',
    defaultMessage: 'Delete',
    description: 'Delete the app',
  },
  appDefault: {
    id: 'appTitle.appDefault',
    defaultMessage: 'Default',
    description: 'Indicates that the app is the default one',
  },
  appNameInUse: {
    id: 'appTitle.appNameInUse',
    defaultMessage: 'Name already in use, please choose another one.',
    description:
      'Error message when trying to set an app name that is already used',
  },
  runAtStartup: {
    id: 'appTitle.runAtStartup',
    defaultMessage: 'Run at startup',
    description: 'Label for the run at startup action',
  },
  setAsDefault: {
    id: 'appTitle.setAsDefault',
    defaultMessage:
      'This app is set as the startup app. This means it will automatically run every time you plug your board into <bold>any power source</bold>',
    description: 'Label for the set as default app',
  },
  overrideAsDefault: {
    id: 'appTitle.overrideAsDefault',
    defaultMessage:
      'Only one app can be set to launch at startup. Enabling this feature for the current app will <bold>override the {appName} app</bold>.',
    description: 'Label for the override default app',
  },
});
