import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  title: {
    id: 'app-lab.flash-board-dialog.title',
    defaultMessage: 'Software updates',
    description: 'Title shown on the software updates dialog',
  },
  subtitle: {
    id: 'app-lab.flash-board-dialog.subtitle',
    defaultMessage: 'Your board software is a bit behind',
    description: 'Subtitle shown on the software updates dialog',
  },
  description: {
    id: 'app-lab.flash-board-dialog.description',
    defaultMessage:
      'Your board needs an update to support the latest App Lab features. Make sure you have at least <bold>10 GB of free space</bold> on your computer. Check our <link>tutorial.</link>',
    description: 'Description shown on the software updates dialog',
  },
  skipButton: {
    id: 'app-lab.flash-board-dialog.skip-button',
    defaultMessage: 'Remind me later',
    description: 'Label for the skip button on the intro dialog',
  },
  updateButton: {
    id: 'app-lab.flash-board-dialog.update-button',
    defaultMessage: 'Update',
    description: 'Label for the update button on the intro dialog',
  },
});
