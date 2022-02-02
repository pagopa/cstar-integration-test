import http from 'k6/http';
import { check } from 'k6';


export function GetCitizenSuccessV2(baseUrl, params, fiscalCode) {
  

  let myParams = Object.assign({}, params)
  myParams.headers.id = fiscalCode
  const res = http.get(
    `${baseUrl}/bpd/hb/citizens/v2`,
    myParams
  );

  const isSuccessful = check(res, {
    'Status: HTTP Success': (r) => r.status === 200,
    'Body: Fiscal Code is OK': (r) => r.json().fiscalCode === fiscalCode,
    'Body: Citizen is Enabled': (r) => r.json().enabled === true
  });

  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }

}

export function GetCitizenNotFoundV2(baseUrl, params, fiscalCode) {
  
  let myParams = Object.assign({}, params)
  myParams.headers.id = fiscalCode

  const res = http.get(
    `${baseUrl}/bpd/hb/citizens/v2`,
    myParams
  );

  const isSuccessful = check(res, { 'Resource Not Found': (r) => r.status === 404 });
  
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }

}

export function GetCitizenBadFormatV2(baseUrl, params, fiscalCode) {
  
  let myParams = Object.assign({}, params)
  myParams.headers.id = fiscalCode

  const res = http.get(
    `${baseUrl}/bpd/hb/citizens/v2`,
    myParams
  );

  const isSuccessful = check(res, { 'Bad Format': (r) => r.status === 400 });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}

export function PutCitizenSuccessV2(baseUrl, params, body) {
    
  const res = http.put(
    `${baseUrl}/bpd/hb/citizens/v2`,
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