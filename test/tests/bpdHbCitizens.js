import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

export function GetCitizenSuccess(baseUrl, params, fiscalCode) {
  
  params.headers.id = fiscalCode;

  const res = http.get(
    `${baseUrl}/bpd/hb/citizens/v2`,
    params
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

export function GetCitizenNotFound(baseUrl, params, fiscalCode) {
  
  params.headers.id = fiscalCode;

  const res = http.get(
    `${baseUrl}/bpd/hb/citizens/v2`,
    params
  );

  const isSuccessful = check(res, { 'Resource Not Found': (r) => r.status === 404 });
  
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }

}

export function GetCitizenBadFormat(baseUrl, params, fiscalCode) {
  
  params.headers.id = fiscalCode;

  const res = http.get(
    `${baseUrl}/bpd/hb/citizens/v2`,
    params
  );

  const isSuccessful = check(res, { 'Bad Format': (r) => r.status === 400 });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}

export function PutCitizenSuccessV1(baseUrl, params, fiscalCode) {

   const res = http.put(
     `${baseUrl}/bpd/hb/citizens/${fiscalCode}`,
     null,
     params
   );
 
   const isSuccessful = check(res, {
     'Status: HTTP Success': (r) => r.status === 200,

   });
  
  console.log(res.body);
  
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

export function PatchCitizenV1(baseUrl, params, fiscalCode, body) {

  params.headers['Content-Type'] = "application/json";


  const res = http.patch(
    `${baseUrl}/bpd/hb/citizens/${fiscalCode}`,
    JSON.stringify(body),
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

export function GetCitizenV1Success(baseUrl, params, fiscalCode) {

  // params.headers['Content-Type'] = "application/json";


  const res = http.patch(
    `${baseUrl}/bpd/hb/citizens/${fiscalCode}`,
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