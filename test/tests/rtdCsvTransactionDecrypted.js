import http from 'k6/http';
import { CheckStatusForbidden } from './common.js';

const API_PREFIX = '/rtd/csv-transaction-decrypted';

export function GetAdeSas(baseUrl, params ) {

  const res = http.post(
    `${baseUrl}${API_PREFIX}/ade/sas`,
	{}, // Empty payload
    params
  )

  CheckStatusForbidden(res);
}

export function GetRtdSas(baseUrl, params ) {

  const res = http.post(
    `${baseUrl}${API_PREFIX}/rtd/sas`,
	{}, // Empty payload
    params
  );

  CheckStatusForbidden(res);
}
