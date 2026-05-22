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

  const {
    lastAppInfo,
    saveAppId,
    resetAppId,
    selectedBoard,
    connToBoardCompleted,
    isAutoSelectingBoard,
    couldNotAutoSelectBoard,
  } = boardsProps;

  // save/reset app id base on route params
  useEffect(() => {
    if (!selectedBoard) {
      return;
    }

    if (currentAppId && currentSection) {
      saveAppId(currentAppId, currentSection).catch(console.error);
    } else {
      resetAppId().catch(console.error);
      // Don't reset hasNavigatedToSavedApp here, it should persist for the session
    }
  }, [currentAppId, currentSection, saveAppId, resetAppId, selectedBoard]);

  // navigate to saved app id after board selection, or fallback to my-apps/examples
  useEffect(() => {
    const navigateToSavedApp = async (): Promise<void> => {
      if (!showRoutes || hasNavigatedToSavedApp) return;

      if (!selectedBoard) {
        return;
      }

      if (currentAppId) {
        return;
      }

      // Reset navigation flag when conditions become available
      if (
        !isAutoSelectingBoard &&
        connToBoardCompleted &&
        selectedBoard &&
        hasNavigatedToSavedApp &&
        !currentAppId
      ) {
        setHasNavigatedToSavedApp(false);
        return;
      }

      // Don't navigate if board is still being configured or auto-selection failed
      if (
        isAutoSelectingBoard ||
        !connToBoardCompleted ||
        couldNotAutoSelectBoard
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
    isAutoSelectingBoard,
    connToBoardCompleted,
    selectedBoard,
  ]);
};
