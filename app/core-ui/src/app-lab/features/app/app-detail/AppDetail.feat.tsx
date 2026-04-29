import {
  AppLabAppDetail,
  AppsSection,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { memo } from 'react';

import { useAppDetailLogic } from './appDetail.logic';

interface AppDetailProps {
  appId: string;
  section: AppsSection;
}

const AppDetailFeat: React.FC<AppDetailProps> = (props: AppDetailProps) => {
  const { appId, section } = props;

  return (
    <AppLabAppDetail
      appId={appId}
      section={section}
      appLabAppDetailLogic={useAppDetailLogic}
    />
  );
};

export default memo(AppDetailFeat);
