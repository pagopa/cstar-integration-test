import http from 'k6/http';
import { check } from 'k6';
import { randomString } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";




export function FindCustomerSuccess(baseUrl, params, fiscalCode) {


  const fakeFiscalCode = randomFiscalCode();

  let myParams = Object.assign({}, params)
  myParams.headers.id = fakeFiscalCode

  http.put(
    `${baseUrl}/fa/hb/customer/fakeFiscalCode`,
    myParams
  );

  const res = http.get(
    `${baseUrl}/fa/hb/customer`,
    myParams
  );

  if (!check(res, {
    'Status: HTTP Success': (r) => r.status === 200,
  })) {
    console.log(`Attempted ${res.headers['Ocp-Apim-Operationid']}. Unsuccessful. Response status ${res.status}. Please check trace ${res.headers['Ocp-Apim-Trace-Location']}`)
  }
}

function randomFiscalCode() {
  "^([A-Za-z]{6}[0-9lmnpqrstuvLMNPQRSTUV]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9lmnpqrstuvLMNPQRSTUV]{2}[A-Za-z]{1}[0-9lmnpqrstuvLMNPQRSTUV]{3}[A-Za-z]{1})$"

  const name = randomString(6);
  const birth_y = (40 + (Math.floor(Math.random() * 50))).toString();
  const birth_m = "M"
  const birth_d = Math.floor(Math.random() * 30).toString()
  const final = [randomString(1), (100 + Math.floor(Math.random() * 899)).toString(), randomString(1)].join("");
  return [name, birth_y, birth_m, birth_d, final].join("");
}
