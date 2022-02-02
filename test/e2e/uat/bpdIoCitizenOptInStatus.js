import { group, check } from 'k6';
import { GetCitizenWithOptInStatusNOREQ, PutCitizenWithOptInStatusACCEPTED } from '../../tests/bpdIoCitizensV2.js';
import dotenv from 'k6/x/dotenv';
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import http from 'k6/http';


export let options = {};
export let services = JSON.parse(open('../../../services/environments.json'));

// open is only available in global scope
const myEnv = dotenv.parse(open(".env.test.local"))


export function setup() {
  let myUrl = new URL(`${services.uat_io.baseUrl}/bpd/pagopa/api/v1/login`);
  myUrl.searchParams.append('fiscalCode', myEnv.FISCAL_CODE_EXISTING);
  let res = http.post(myUrl.toString(), {});

  check(res, { 'Received JWT': (r) => r.status === 200 });
  return res.body;
}

export default (authToken) => {

  group('Citizen OptIn Status', () => {
    let params = {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Ocp-Apim-Subscription-Key': `${myEnv.APIM_SK};product=app-io-product`,
        'Ocp-Apim-Trace': 'true'
      }
    }

    group('Should GET Citizen with NOREQ status', () => GetCitizenWithOptInStatusNOREQ(
      services.uat_io.baseUrl, params, myEnv.FISCAL_CODE_EXISTING));
    group('Should PUT Citizen with ACCEPTED status', () => PutCitizenWithOptInStatusACCEPTED(
      services.uat_io.baseUrl, params, myEnv.FISCAL_CODE_EXISTING));

  });
}