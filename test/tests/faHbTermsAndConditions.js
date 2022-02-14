import http from 'k6/http';
import { check } from 'k6';

export function GetFaTermsAndConditionsViaBlob(baseUrl, params) {

  const res = http.get(
    `${baseUrl}/pagopastorage/fa-terms-and-conditions/fa-tc.html`,
    params
  );

  const isSuccessful = check(res, { 'Success': (r) => r.status > 299 });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}

export function GetFaTermsAndConditions(baseUrl, params) {

  const res = http.get(
    `${baseUrl}/fa/tc/html`,
    params
  );

  const isSuccessful = check(res, { 'Success': (r) => r.status === 200 });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}