import http from 'k6/http';
import { check } from 'k6';

export function GetCitizenWithOptInStatusNOREQ(baseUrl, params, fiscalCode) {
  
  let myParams = Object.assign({}, params)
  myParams.headers.id = fiscalCode

  const res = http.get(
    `${baseUrl}/bpd/io/citizen/v2`,
    myParams
  ); 

  const isSuccessful = check(res, {
    'Status: HTTP Success': (r) => r.status === 200,
    'Body: Fiscal Code is OK': (r) => r.json().fiscalCode === fiscalCode,
    'Body: Citizen is Enabled': (r) => r.json().enabled === true,
    'Body: Citizen never received an OptIn request': (r) => r.json().optInStatus === 'NOREQ'
  });

  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }

}

export function DeleteCitizen(baseUrl, params, fiscalCode) {
  
  let myParams = Object.assign({}, params)
  myParams.headers.id = fiscalCode
  myParams.headers['Content-Type'] = "application/json"

  const res = http.del(
    `${baseUrl}/bpd/io/citizen/v2`,
    JSON.stringify({}),
    myParams
  );

  const isSuccessful = check(res, {
    'Status: HTTP Success': (r) => r.status === 204
    // 'Body: Fiscal Code is OK': (r) => r.json().fiscalCode === fiscalCode,
    // 'Body: Citizen is Enabled': (r) => r.json().enabled === false,
    // 'Body: Citizen never received an OptIn request:': (r) => r.json().optInStatus === 'NOREQ'
  });

  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }

}

export function PutCitizenWithOptInStatusACCEPTED(baseUrl, params, fiscalCode) {
  
  let myParams = Object.assign({}, params)
  myParams.headers.id = fiscalCode
  myParams.headers['Content-Type'] = "application/json"

  const res = http.put(
    `${baseUrl}/bpd/io/citizen/v2`,
    JSON.stringify({optInStatus: 'ACCEPTED'}),
    myParams
  ); 

  const isSuccessful = check(res, {
    'Status: HTTP Success': (r) => r.status === 200,
    'Body: Fiscal Code is OK': (r) => r.json().fiscalCode === fiscalCode,
    'Body: Citizen is Enabled': (r) => r.json().enabled === true,
    'Body: Citizen ACCEPTED OptIn': (r) => r.json().optInStatus === 'ACCEPTED'
  });

  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }

}

export function PutCitizenWithOptInStatusDENIED(baseUrl, params, fiscalCode) {
  
  let myParams = Object.assign({}, params)
  myParams.headers.id = fiscalCode
  myParams.headers['Content-Type'] = "application/json"

  const res = http.put(
    `${baseUrl}/bpd/io/citizen/v2`,
    JSON.stringify({optInStatus: 'DENIED'}),
    myParams
  ); 

  const isSuccessful = check(res, {
    'Status: HTTP Success': (r) => r.status === 200,
    'Body: Fiscal Code is OK': (r) => r.json().fiscalCode === fiscalCode,
    'Body: Citizen is Enabled': (r) => r.json().enabled === true,
    'Body: Citizen DENIED OptIn': (r) => r.json().optInStatus === 'DENIED'
  });

  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }

}

export function PutCitizenWithOptInStatusNOREQAfterACCEPTED(baseUrl, params, fiscalCode) {
  
  let myParams = Object.assign({}, params)
  myParams.headers.id = fiscalCode
  myParams.headers['Content-Type'] = "application/json"

  const res = http.put(
    `${baseUrl}/bpd/io/citizen/v2`,
    JSON.stringify({optInStatus: 'NOREQ'}),
    myParams
  ); 

  const isSuccessful = check(res, {
    'Status: HTTP Success': (r) => r.status === 200,
    'Body: Fiscal Code is OK': (r) => r.json().fiscalCode === fiscalCode,
    'Body: Citizen is Enabled': (r) => r.json().enabled === true,
    'Body: Citizen ACCEPTED OptIn': (r) => r.json().optInStatus === 'ACCEPTED'
  });

  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }

}

export function PutCitizenWithOptInStatusNOREQAfterDENIED(baseUrl, params, fiscalCode) {
  
  let myParams = Object.assign({}, params)
  myParams.headers.id = fiscalCode
  myParams.headers['Content-Type'] = "application/json"

  const res = http.put(
    `${baseUrl}/bpd/io/citizen/v2`,
    JSON.stringify({optInStatus: 'NOREQ'}),
    myParams
  ); 

  const isSuccessful = check(res, {
    'Status: HTTP Success': (r) => r.status === 200,
    'Body: Fiscal Code is OK': (r) => r.json().fiscalCode === fiscalCode,
    'Body: Citizen is Enabled': (r) => r.json().enabled === true,
    'Body: Citizen DENIED OptIn': (r) => r.json().optInStatus === 'DENIED'
  });

  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }

}

export function PutCitizenWithoutOptInStatus(baseUrl, params, fiscalCode) {
  
  let myParams = Object.assign({}, params)
  myParams.headers.id = fiscalCode
  myParams.headers['Content-Type'] = "application/json"

  const res = http.put(
    `${baseUrl}/bpd/io/citizen/v2`,
    JSON.stringify({}),
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