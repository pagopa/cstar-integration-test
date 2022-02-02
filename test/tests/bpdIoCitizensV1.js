import http from 'k6/http';
import { check } from 'k6';

export function GetCitizenV1Success(baseUrl, params, fiscalCode) {

  // params.headers['Content-Type'] = "application/json";


  const res = http.patch(
    `${baseUrl}/bpd/io/citizen/`,
    params
  );

  console.log(res.body);

  const isSuccessful = check(res, {
    'Status: HTTP Success': (r) => r.status === 200,
  });

  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}