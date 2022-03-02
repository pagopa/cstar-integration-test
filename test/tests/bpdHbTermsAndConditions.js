import http from 'k6/http';
import { CheckStatusConflict, CheckStatusOk } from './common.js';

export function GetBpdTermsAndConditionsViaBlob(baseUrl, params) {

  const res = http.get(
    `${baseUrl}/pagopastorage/bpd-terms-and-conditions/bpd-tc.html`,
    params
  )

  CheckStatusConflict(res);
}

export function GetBpdTermsAndConditions(baseUrl, params) {

  const res = http.get(
    `${baseUrl}/bpd/tc/html`,
    params
  );

  CheckStatusOk(res);
}
