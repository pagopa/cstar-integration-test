import http from 'k6/http';
import { CheckStatusForbidden } from './common.js';

export function GetAdeSas(baseUrl, params ) {

  const res = http.post(
    `${baseUrl}/rtd/csv-transaction-decrypted/ade/sas`,
	{}, // Empty payload
    params
  )

  CheckStatusForbidden(res);
}

export function GetRtdSas(baseUrl, params ) {

  const res = http.post(
    `${baseUrl}/rtd/csv-transaction-decrypted/rtd/sas`,
	{}, // Empty payload
    params
  );

  CheckStatusForbidden(res);
}
