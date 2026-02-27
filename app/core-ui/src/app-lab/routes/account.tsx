import { createFileRoute } from '@tanstack/react-router';

import Account from '../features/account/Account.feat';

export const Route = createFileRoute('/account')({
  component: Account,
});
