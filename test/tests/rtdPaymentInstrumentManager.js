import http from 'k6/http';
import { check } from 'k6';

export function GetHashedPan(baseUrl, params ) {

  const res = http.get(
    `${baseUrl}/rtd/payment-instrument-manager/hashed-pans`,
    params
  );

  const isSuccessful = check(res, { 'Success': (r) => r.status === 200 });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`);
  }
}

export function GetSalt(baseUrl, params ) {

  const res = http.get(
    `${baseUrl}/rtd/payment-instrument-manager/salt`,
    params
  );

  const isSuccessful = check(res, { 'Success': (r) => r.status === 200 });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`);
  }
}
