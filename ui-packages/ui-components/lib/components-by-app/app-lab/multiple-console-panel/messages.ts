import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  runAppToGenerate: {
    id: 'appLabMultipleConsolePanel.runAppToGenerate',
    defaultMessage: 'Run the app to start generating logs',
    description: 'Message shown to run the app to generate logs in the console',
  },
  enableAutoscroll: {
    id: 'appLabMultipleConsolePanel.enableAutoscroll',
    defaultMessage: 'Enable autoscroll',
    description: 'Label for the button to enable autoscroll in the console',
  },
  disableAutoscroll: {
    id: 'appLabMultipleConsolePanel.disableAutoscroll',
    defaultMessage: 'Disable autoscroll',
    description: 'Label for the button to disable autoscroll in the console',
  },
  clearLog: {
    id: 'appLabMultipleConsolePanel.clearLog',
    defaultMessage: 'Clear log',
    description: 'Label for the button to clear the console log',
  },
  hideTimestamp: {
    id: 'appLabMultipleConsolePanel.hideTimestamp',
    defaultMessage: 'Hide timestamp',
    description: 'Label for the button to hide timestamps in the console',
  },
  showTimestamp: {
    id: 'appLabMultipleConsolePanel.showTimestamp',
    defaultMessage: 'Show timestamp',
    description: 'Label for the button to show timestamps in the console',
  },
  openConsole: {
    id: 'appLabMultipleConsolePanel.openConsole',
    defaultMessage: 'Open console',
    description: 'Message shown to open console',
  },
  maximize: {
    id: 'appLabMultipleConsolePanel.maximize',
    defaultMessage: 'Maximize',
    description: 'Label for the button to maximize the console',
  },
  minimize: {
    id: 'appLabMultipleConsolePanel.minimize',
    defaultMessage: 'Minimize',
    description: 'Label for the button to minimize the console',
  },
  close: {
    id: 'appLabMultipleConsolePanel.close',
    defaultMessage: 'Close',
    description: 'Label for the button to close the console',
  },
  description: {
    id: 'appLabMultipleConsolePanel.description',
    defaultMessage: 'Run the app to start generating logs',
    description: 'Description for the multiple console panel',
  },
  sendMessagePlaceholder: {
    id: 'appLabMultipleConsolePanel.sendMessagePlaceholder',
    defaultMessage:
      'Message (Enter to send a message to “{name}” on {address})',
    description: 'Placeholder text for the send message input',
  },
  sendMessageNoBoardPlaceholder: {
    id: 'appLabMultipleConsolePanel.sendMessageNoBoardPlaceholder',
    defaultMessage: 'Message (Enter to send a message to your board)',
    description:
      'Placeholder text for the send message input when no boards are available yet',
  },
});
