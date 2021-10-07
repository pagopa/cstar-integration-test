import { group } from 'k6';
import {GetCitizenRandomFiscalCode} from '../../tests/bpdHbCitizensV1.js';
import dotenv from 'k6/x/dotenv';



export let options = JSON.parse(open('../../../options/low_load.json'));
export let services = JSON.parse(open('../../../services/environments.json'));

// open is only available in global scope
const myEnv = dotenv.parse(open(".env.development.local"))


options.tlsAuth = [
  {
    domains: [services.uat_issuer.baseUrl],
    cert: open('../../../certs/cstar_u_test.cert'),
    key: open('../../../certs/cstar_u_test.key'),
  }
];

export default () => {


  group('Citizen API', () => {
    let params = {
      headers: {
        'Ocp-Apim-Subscription-Key': `${myEnv.APIM_SK};product=issuer-api-product`,
        'Ocp-Apim-Trace': 'true',
      }
    }

    group('Should GET a Random Citizen', () => GetCitizenRandomFiscalCode(services.dev_issuer.baseUrl, params));


  });
}