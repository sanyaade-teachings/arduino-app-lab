import {
  AppLabSettings,
  TopBar,
  TopBarBack,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { useRouter } from '@tanstack/react-router';
import { useCallback } from 'react';

import { createUseSettingsLogic } from './settings.logic';
import styles from './settings.module.scss';

const Settings: React.FC = () => {
  const settingsLogic = useCallback(() => createUseSettingsLogic()(), []);

  const router = useRouter();
  const goBack = useCallback(() => {
    // Check if we can go back in history
    if (window.history.length > 1) {
      router.history.back();
    } else {
      // Fallback to examples if no history
      router.navigate({ to: '/examples' });
    }
  }, [router]);

  return (
    <section className={styles['main']}>
      <div className={styles['header']}>
        <TopBar
          pathItems={[<TopBarBack label="Settings" onClick={goBack} key={0} />]}
        />
      </div>
      <div className={styles['body']}>
        <div className={styles['content']}>
          <AppLabSettings settingsLogic={settingsLogic} />
        </div>
      </div>
    </section>
  );
};
export default Settings;
