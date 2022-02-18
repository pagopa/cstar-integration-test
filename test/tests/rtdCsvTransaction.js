import http from 'k6/http';
import { check } from 'k6';

export function GetPublicKey(baseUrl, params ) {

  const res = http.get(
    `${baseUrl}/rtd/csv-transaction/publickey`,
    params
  );

  const isSuccessful = check(res, { 'Success': (r) => r.status === 200 });
  const isBodyPgpPublicKey = check(res, { 'Success': (r) => r.body.includes('-----BEGIN PGP PUBLIC KEY BLOCK-----') });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`);
  }
}

export function GetAdeSas(baseUrl, params ) {

  const res = http.post(
    `${baseUrl}/rtd/csv-transaction/ade/sas`,
	{}, // Empty payload
    params
  );

  const isSuccessful = check(res, { 'Success': (r) => r.status === 201 });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`);
  }
}

export function GetRtdSas(baseUrl, params ) {

  const res = http.post(
    `${baseUrl}/rtd/csv-transaction/rtd/sas`,
	{}, // Empty payload
    params
  );

  const isSuccessful = check(res, { 'Success': (r) => r.status === 201 });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`);
  }
}
