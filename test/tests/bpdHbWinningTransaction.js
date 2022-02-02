import http from 'k6/http';
import { check } from 'k6';

export function GetTotalCashBack(baseUrl, params, periodId, fiscalCode) {

  let myParams = Object.assign({}, params)
  myParams.headers.id = fiscalCode

  const res = http.get(
    `${baseUrl}/bpd/hb/winning-transactions/v2/total-cashback?awardPeriodId=${periodId}`,
    myParams
  );

  const isSuccessful = check(res, { 'Success': (r) => r.status === 200 });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}

export function GetTotalCashBackV1(baseUrl, params, periodId, fiscalCode) {

  const res = http.get(
    `${baseUrl}/bpd/hb/winning-transactions/v2/total-cashback?awardPeriodId=${periodId}&fiscalCode=${fiscalCode}`,
    params
  );

  const isSuccessful = check(res, { 'Success': (r) => r.status === 200 });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}