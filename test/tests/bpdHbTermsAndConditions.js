import http from 'k6/http';
import { check } from 'k6';

export function GetBpdTermsAndConditionsViaBlob(baseUrl, params) {

  const res = http.get(
    `${baseUrl}/pagopastorage/bpd-terms-and-conditions/bpd-tc.html`,
    params
  );

  const isSuccessful = check(res, { 'Success': (r) => r.status === 200 });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}

export function GetBpdTermsAndConditions(baseUrl, params) {

  const res = http.get(
    `${baseUrl}/bpd/tc/html`,
    params
  );

  const isSuccessful = check(res, { 'Success': (r) => r.status === 200 });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}

// Fails. Info privacy file is not uploaded in the blob storage
export function GetBpdPrivacyPolicy(baseUrl, params) {

  const res = http.get(
    `${baseUrl}/cstar-bpd/info-privacy`,
    params
  );

  const isSuccessful = check(res, { 'Success': (r) => r.status === 200 });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}