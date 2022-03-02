import http from 'k6/http';
import { CheckStatusOk, CheckBodyLengthBetween } from './common.js';

const API_PREFIX = '/rtd/payment-instrument-manager';

export function GetHashedPan(baseUrl, params, opts) {

  const res = http.get(
    `${baseUrl}${API_PREFIX}/hashed-pans`,
    params
  );

  CheckStatusOk(res);
  CheckBodyLengthBetween(res, 0, opts.maxContentLength);
}

export function GetSalt(baseUrl, params) {

  const res = http.get(
    `${baseUrl}${API_PREFIX}/salt`,
    params
  );

  CheckStatusOk(res);
}
