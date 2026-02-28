import { eventsOn } from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';

import { openLinkExternal } from '../services-by-app/app-lab';
import {
  EdgeImpulseClient,
  EdgeImpulseClientOptions,
} from './edgeImpulseAuthClient';
import { EdgeImpulseUser } from './edgeImpulseAuthService.type';
import { defaultDesktopEdgeImpulseOptions } from './edgeImpulseAuthUtils';

function getOptions(): EdgeImpulseClientOptions {
  return defaultDesktopEdgeImpulseOptions;
}

export let eiAuthClient: EdgeImpulseClient | null = null;

export async function createEdgeImpulseInstance(
  options: EdgeImpulseClientOptions,
): Promise<EdgeImpulseClient> {
  const config: EdgeImpulseClientOptions = {
    ...options,
  };

  const client = new EdgeImpulseClient(config);
  await client.waitForInitialization();

  return client;
}

export async function getEIAuthClient(): Promise<EdgeImpulseClient> {
  if (!eiAuthClient) {
    eiAuthClient = await initialize();
  }
  return eiAuthClient;
}

async function initialize(): Promise<EdgeImpulseClient> {
  const options = getOptions();
  const instance = await createEdgeImpulseInstance(options);

  eiAuthClient = instance;
  return instance;
}

export async function edgeImpulseLoginWithBrowser(): Promise<void> {
  if (!eiAuthClient) {
    await initialize();
  }

  return new Promise((resolve, reject) => {
    const cancelListener = eventsOn('auth-deep-link', async (url: string) => {
      try {
        await eiAuthClient?.handleRedirectCallback(url);
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        cancelListener();
      }
    });

    const executeLogin = async (): Promise<void> => {
      try {
        const authUrl = await eiAuthClient?.getAuthorizationUrl();
        if (authUrl) {
          openLinkExternal(authUrl);
        }
      } catch (error) {
        cancelListener();
        reject(error);
      }
    };

    executeLogin();
  });
}

export async function getEIAccessToken(): Promise<string> {
  if (!eiAuthClient) {
    throw new Error('Cannot get token when EI Auth client not initialized');
  }

  return eiAuthClient.getTokenSilently();
}

export async function isAuthenticatedEI(): Promise<boolean> {
  if (!eiAuthClient) {
    throw new Error('Can not authenticate when EI Auth client not initialized');
  }

  return eiAuthClient.store.isAuthenticated;
}

export async function logoutEI(): Promise<void> {
  if (!eiAuthClient) {
    throw new Error('Cannot logout when auth client not initialized');
  }

  await eiAuthClient.logout();
  eiAuthClient = null;
}

export async function retrieveEIUser(): Promise<EdgeImpulseUser | null> {
  if (!eiAuthClient) {
    throw new Error('Cannot get user when  EI Auth client not initialized');
  }

  return eiAuthClient.getUser() || null;
}
