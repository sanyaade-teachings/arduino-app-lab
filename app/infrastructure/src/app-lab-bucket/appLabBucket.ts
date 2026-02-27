import { Config } from '@cloud-editor-mono/common';

import { httpGet, httpGetRaw } from '../fetch';
import { MandatoryUpdateJson, MandatoryUpdateList } from './appLabBucket.type';
import { mapGetMandatoryUpdatesListResponse } from './mapper';

export async function getMandatoryUpdatesListRequest(): Promise<MandatoryUpdateList> {
  const endpoint = '/Stable/mandatory-updates.json';
  const response = await httpGet<MandatoryUpdateJson>({
    url: Config.APP_LAB_BUCKET_URL,
    endpoint,
  });

  if (!response) {
    throw new Error(
      `Call to "${endpoint}" did not respond with the expected result`,
    );
  }

  return mapGetMandatoryUpdatesListResponse(response);
}

export function getReleaseImageUrl(tag: string): string {
  return `${Config.APP_LAB_BUCKET_URL}/Stable/release-notes/${tag}.png`;
}

export async function getReleaseNotesRequest(tag: string): Promise<string> {
  const endpoint = `/Stable/release-notes/${tag}.md`;
  const response = await httpGetRaw({
    url: Config.APP_LAB_BUCKET_URL,
    endpoint,
  });

  if (!response) {
    throw new Error(
      `Call to "${endpoint}" did not respond with the expected result`,
    );
  }

  return response.text();
}
