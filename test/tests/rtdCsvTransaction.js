import http from 'k6/http';
import { CheckStatusOk, CheckStatusCreated, CheckBodyPgpPublicKey } from './common.js';

const API_PREFIX = '/rtd/csv-transaction';

export function GetPublicKey(baseUrl, params ) {

  const res = http.get(
    `${baseUrl}${API_PREFIX}/publickey`,
    params
  )

  CheckStatusOk(res);
  CheckBodyPgpPublicKey(res);
}

export function GetAdeSas(baseUrl, params ) {

  const res = http.post(
    `${baseUrl}${API_PREFIX}/ade/sas`,
	{}, // Empty payload
    params
  )

  CheckStatusCreated(res);
}

export function GetRtdSas(baseUrl, params ) {

  const res = http.post(
    `${baseUrl}${API_PREFIX}/rtd/sas`,
	{}, // Empty payload
    params
  )

  CheckStatusCreated(res);
}
