import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

export function GetBpdIoPaymentInstrumentSuccess(baseUrl, params, payInstrId) {

  console.log(
    `${baseUrl}/bpd/io/payment-instruments/${payInstrId}`);
      
  const res = http.get(
    `${baseUrl}/bpd/io/payment-instruments/${payInstrId}`,
    params
  );
  
  const isSuccessful = check(res, { 'Success': (r) => r.status === 200 });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}
  
export function GetBpdIoPaymentInstrumentAuthError(baseUrl, params, payInstrId) {
    const res = http.get(
      `${baseUrl}/bpd/io/payment-instruments/${payInstrId}`,
      params
    );
    
    const isSuccessful = check(res, { 'Success': (r) => r.status === 200 });
    if (!isSuccessful) {
      console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
    }
}

export function PutBpdPaymentInstrument(baseUrl, params, payload) {

  params.headers['Content-Type'] = "application/json"


  const res = http.put(
    `${baseUrl}/bpd/hb/payment-instruments/card`,
    JSON.stringify(payload),
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