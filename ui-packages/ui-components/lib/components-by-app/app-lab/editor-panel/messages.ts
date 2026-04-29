import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  codeCopied: {
    id: 'app-lab-editor.code-copied',
    defaultMessage: 'Code copied to clipboard',
    description: 'Notification message shown when code is copied to clipboard',
  },
  readOnlyBanner: {
    id: 'app-lab-editor.read-only-banner',
    defaultMessage:
      ' Read-only code. Create your own app from this example to edit.',
    description: 'Label for the read only banner in the editor panel',
  },
});
