import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

export function GetAwardPeriodSuccess(baseUrl, params) {

  console.log(`${baseUrl}/bpd/hb/award-periods/v2`);

  const res = http.get(
    `${baseUrl}/bpd/hb/award-periods/v2`,
    params
  );

  const isSuccessful = check(res, { 'Success': (r) => r.status === 200 });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}