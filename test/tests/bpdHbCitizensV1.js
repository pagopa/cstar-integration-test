import http from 'k6/http';
import { check } from 'k6';
import { randomString } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";



export function GetCitizenV1Success(baseUrl, params, fiscalCode) {

  const res = http.get(
    `${baseUrl}/bpd/hb/citizens/${fiscalCode}`,
    params
  );

  const isSuccessful = check(res, {
    'Status: HTTP Success': (r) => r.status === 200,
  });

  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}

export function GetCitizenRandomFiscalCode(baseUrl, params) {

  const fakeFiscalCode = randomString(16);

  const res = http.get(
    `${baseUrl}/bpd/hb/citizens/${fakeFiscalCode}`,
    params
  );

  if (!check(res, {
    'Status: No Server Error': (r) => (r.status >= 400 && r.status <= 499) || r.status === 200,
  })) {
    console.log(fakeFiscalCode)
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}

export function PatchCitizenV1(baseUrl, params, fiscalCode, body) {

  const res = http.patch(
    `${baseUrl}/bpd/hb/citizens/${fiscalCode}`,
    JSON.stringify(body),
    params
  );

  const isSuccessful = check(res, {
    'Status: HTTP Success': (r) => r.status === 200,
  });

  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}

export function GetRankingV1Success(baseUrl, params, fiscalCode, awardPeriodId) {

  const res = http.get(
    `${baseUrl}/bpd/hb/citizens/${fiscalCode}/ranking?awardPeriodId=${awardPeriodId}`,
    params
  );

  const isSuccessful = check(res, {
    'Status: HTTP Success': (r) => r.status === 200,
  });

  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}


export function DeleteCitizenV1Success(baseUrl, params, fiscalCode) {

  const res = http.delete(
    `${baseUrl}/bpd/hb/citizens/${fiscalCode}`,
    params
  );


  const isSuccessful = check(res, {
    'Status: HTTP Success': (r) => r.status === 200,
  });

  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}
