import http from 'k6/http';
import { check } from 'k6';

export function GetBpdHbPaymentInstrumentSuccess(baseUrl, params, payInstrId) {
  
  let myParams = Object.assign({}, params)
  myParams.headers.id = payInstrId

  const res = http.get(
    `${baseUrl}/bpd/hb/payment-instruments/v2`,
    myParams
  );

  
  const isSuccessful = check(res, { 'Success': (r) => r.status === 200 });
  if (!isSuccessful) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}
  
