import http from 'k6/http';
import { CheckStatusConflict, CheckStatusOk } from './common.js';

export function GetFaTermsAndConditionsViaBlob(baseUrl, params) {

  const res = http.get(
    `${baseUrl}/pagopastorage/fa-terms-and-conditions/fa-tc.html`,
    params
  )

  CheckStatusConflict(res);
}

export function GetFaTermsAndConditions(baseUrl, params) {

  const res = http.get(
    `${baseUrl}/fa/tc/html`,
    params
  );

  CheckStatusOk(res);
}
