import { AppInfo } from '@cloud-editor-mono/infrastructure';
import { AppsSection } from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { UseBoards } from './useBoards';

export type UseReloadApp = (props: {
  boardsProps: ReturnType<UseBoards>;
  showRoutes: boolean;
  currentAppId?: string;
  apps?: AppInfo[];
  currentSection?: AppsSection;
}) => void;

export const useReloadApp: UseReloadApp = ({
  boardsProps,
  showRoutes,
  currentAppId,
  apps,
  currentSection,
}) => {
  const navigate = useNavigate();
  const [hasNavigatedToSavedApp, setHasNavigatedToSavedApp] = useState(false);

  const { lastAppInfo, saveAppId, resetAppId } = boardsProps;

  // save/reset app id base on route params
  useEffect(() => {
    if (!boardsProps.selectedBoard) {
      return;
    }

    if (currentAppId && currentSection) {
      saveAppId(currentAppId, currentSection).catch(console.error);
    } else {
      resetAppId().catch(console.error);
      // Don't reset hasNavigatedToSavedApp here, it should persist for the session
    }
  }, [
    currentAppId,
    currentSection,
    saveAppId,
    resetAppId,
    boardsProps.selectedBoard,
  ]);

  // navigate to saved app id after board selection, or fallback to my-apps/examples
  useEffect(() => {
    const navigateToSavedApp = async (): Promise<void> => {
      // Reset isAutoNavigating
      if (
        !showRoutes ||
        hasNavigatedToSavedApp ||
        !boardsProps.selectedBoard ||
        currentAppId ||
        boardsProps.isAutoSelectingBoard ||
        !boardsProps.connToBoardCompleted
      ) {
        return;
      }

      try {
        if (lastAppInfo) {
          setHasNavigatedToSavedApp(true);
          const route =
            lastAppInfo.section === 'examples'
              ? '/examples/$appId'
              : '/my-apps/$appId';
          const navParams = { appId: lastAppInfo.appId };
          await navigate({ to: route, params: navParams });
          return;
        }

        // fallback to section
        setHasNavigatedToSavedApp(true);
        const hasUserApps = apps && apps.length > 0;
        const fallbackRoute = hasUserApps ? '/my-apps' : '/examples';
        await navigate({ to: fallbackRoute });
      } catch (error) {
        console.error('Failed to navigate to saved app:', error);
      }
    };

    navigateToSavedApp();
  }, [
    showRoutes,
    lastAppInfo,
    hasNavigatedToSavedApp,
    currentAppId,
    apps,
    navigate,
    boardsProps.isAutoSelectingBoard,
    boardsProps.connToBoardCompleted,
    boardsProps.selectedBoard,
  ]);
};
