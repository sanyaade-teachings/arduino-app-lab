import { createFileRoute, useParams } from '@tanstack/react-router';

import AppDetailFeat from '../../features/app/app-detail/AppDetail.feat';

const UserAppDetail: React.FC = () => {
  const { appId } = useParams({ from: '/my-apps/$appId' });
  return <AppDetailFeat key={appId} appId={appId} section="my-apps" />;
};

export const Route = createFileRoute('/my-apps/$appId')({
  component: UserAppDetail,
  gcTime: 0,
});
