import { createFileRoute, useParams } from '@tanstack/react-router';

import AppDetailFeat from '../../features/app/app-detail/AppDetail.feat';

const ExampleAppDetail: React.FC = () => {
  const { appId } = useParams({ from: '/examples/$appId' });
  return <AppDetailFeat key={appId} appId={appId} section="examples" />;
};

export const Route = createFileRoute('/examples/$appId')({
  component: ExampleAppDetail,
  gcTime: 0,
});
