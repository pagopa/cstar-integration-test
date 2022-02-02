
import http from 'k6/http';
import { check } from 'k6';

export function GetHashedPan(baseUrl, params ) {

  // console.log(`${baseUrl}/rtd/payment-instrument-manager/hashed-pans`)

  const res = http.get(
    `${baseUrl}/rtd/payment-instrument-manager/hashed-pans`,
    params
  );

  // const res = http.get(
  //   'https://cstarpblobstorage.blob.core.windows.net/cstar-exports/hashedPans.zip',
  //   params
  // );
  
  const isSuccessful = check(res, { 'Success': (r) => r.status === 200 });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}
