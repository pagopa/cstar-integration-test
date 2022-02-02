import http from 'k6/http';
import { check } from 'k6';

export function GetCitizenWithOptInStatusNOREQ(baseUrl, params, fiscalCode) {
  
  let myParams = Object.assign({}, params)
  myParams.headers.id = fiscalCode

  const res = http.get(
    `${baseUrl}/bpd/io/citizen/v2`,
    myParams
  ); 

  console.log(res.json().optInStatus)


  const isSuccessful = check(res, {
    'Status: HTTP Success': (r) => r.status === 200,
    'Body: Fiscal Code is OK': (r) => r.json().fiscalCode === fiscalCode,
    'Body: Citizen is Enabled': (r) => r.json().enabled === true,
    'Body: Citizen never received an OptIn request:': (r) => r.json().optInStatus === 'NOREQ'
  });

  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }

}

export function PutCitizenWithOptInStatusACCEPTED(baseUrl, params, fiscalCode) {
  
  let myParams = Object.assign({}, params)
  myParams.headers.id = fiscalCode

  const res = http.put(
    `${baseUrl}/bpd/io/citizen/v2`,
    JSON.stringify({optInStatus: 'ACCEPTED'}),
    myParams
  ); 

  console.log(res.json().optInStatus)

  const isSuccessful = check(res, {
    'Status: HTTP Success': (r) => r.status === 200,
    'Body: Fiscal Code is OK': (r) => r.json().fiscalCode === fiscalCode,
    'Body: Citizen is Enabled': (r) => r.json().enabled === true,
    'Body: Citizen ACCEPTED OptIn:': (r) => r.json().optInStatus === 'ACCEPTED'
  });

  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }

}