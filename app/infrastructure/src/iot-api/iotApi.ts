import { Config } from '@cloud-editor-mono/common';
import { WretchError } from 'wretch/types';

import { httpGet, httpPut, httpPutRaw } from '../fetch';
import { ORGANIZATION_HEADER } from '../utils';
import {
  ArduinoDevicev2_IoTApi,
  CheckThingCert_IotApi,
  CheckThingCert_Response,
  CheckThingCertParams_IotApi,
  ListDevicesV2_Response,
  ListDevicesV2Params_IotApi,
  SendDeviceV2OtaBody_IoTApi,
  SendDeviceV2OtaParams_IoTApi,
  ShowDeviceV2_Response,
  ShowDeviceV2Params_IoTApi,
  ShowThingV1Device_Response,
  ShowThingV1DeviceParams_IoTApi,
} from './iotApi.type';
import {
  mapCheckThingCertResponse,
  mapListDevicesV2Response,
  mapShowDeviceV2Response,
  mapShowThingDeviceResponse,
} from './mapper';

export async function listDevicesV2Request(
  token: string,
  params?: ListDevicesV2Params_IotApi,
): Promise<ListDevicesV2_Response> {
  const { header, query } = { ...params };
  const endpoint = '/v2/devices';

  const response = await httpGet<ArduinoDevicev2_IoTApi[]>({
    url: Config.IOT_API_URL,
    endpoint,
    token,
    params: query,
    headers: header,
  });

  if (!response) {
    throw new Error(
      `Call to "${endpoint}" did not respond with the expected result`,
    );
  }

  return mapListDevicesV2Response(response);
}

export async function showDeviceV2Request(
  token: string,
  params: ShowDeviceV2Params_IoTApi,
): Promise<ShowDeviceV2_Response> {
  const { path, header } = { ...params };
  const endpoint = `/v2/devices/${path.id}`;

  const response = await httpGet<ArduinoDevicev2_IoTApi>({
    url: Config.IOT_API_URL,
    endpoint,
    token,
    headers: header,
  });

  if (!response) {
    throw new Error(
      `Call to "${endpoint}" did not respond with the expected result`,
    );
  }

  return mapShowDeviceV2Response(response);
}

export async function showThingDeviceRequest(
  token: string,
  params: ShowThingV1DeviceParams_IoTApi,
): Promise<ShowThingV1Device_Response> {
  const { path, query, header } = { ...params };
  const endpoint = `/v1/things/${path.id}/device`;

  const response = await httpGet<ArduinoDevicev2_IoTApi>({
    url: Config.IOT_API_URL,
    endpoint,
    token,
    params: query,
    headers: header,
  });

  if (!response) {
    throw new Error(
      `Call to "${endpoint}" did not respond with the expected result`,
    );
  }

  return mapShowThingDeviceResponse(response);
}

export async function deviceV2SendRequest(
  body: SendDeviceV2OtaBody_IoTApi,
  token: string,
  params: SendDeviceV2OtaParams_IoTApi & {
    header?: {
      [ORGANIZATION_HEADER]: string;
    };
  },
): Promise<boolean> {
  const { path, header } = { ...params };
  const endpoint = `/v2/devices/${path.id}/ota`;

  const response = await httpPutRaw({
    url: Config.IOT_API_URL,
    endpoint,
    body,
    token,
    headers: header,
  });

  if (!response || (response.status !== 200 && response.status !== 202)) {
    throw new Error(
      `Call to "${endpoint}" did not respond with the expected result`,
    );
  }

  return true;
}

export async function checkThingCertRequest(
  token: string,
  params: CheckThingCertParams_IotApi,
): Promise<CheckThingCert_Response> {
  const { path, header } = { ...params };
  const endpoint = `/v2/things/${path.id}/check`;

  let error: WretchError | undefined = undefined;
  const response = await httpPut<CheckThingCert_IotApi>({
    url: Config.IOT_API_URL,
    endpoint,
    token,
    headers: header,
    handleError: (err: WretchError) => {
      error = err;
    },
  });

  if (!response || error) {
    throw new Error(
      `Call to "${endpoint}" did not respond with the expected result`,
      error
        ? {
            cause: error,
          }
        : undefined,
    );
  }

  return mapCheckThingCertResponse(response);
}
