import { createFileRoute } from '@tanstack/react-router';

import LearnList from '../../features/learn/learn-list/LearnList.feat';

export const Route = createFileRoute('/learn/')({
  component: () => {
    return <LearnList />;
  },
});
