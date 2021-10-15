import { group } from 'k6';
import {GetCitizenRandomFiscalCode} from '../../tests/bpdHbCitizensV1.js';
import dotenv from 'k6/x/dotenv';



export let options = JSON.parse(open('../../../options/ramp_load.json'));
export let services = JSON.parse(open('../../../services/environments.json'));

// open is only available in global scope
const myEnv = dotenv.parse(open(".env.development.local"))


// patch options
options.tlsAuth = [
  {
    domains: [services.uat_issuer.baseUrl],
    cert: open(`../../../certs/${myEnv.MAUTH_CERT_NAME}`),
    key: open(`../../../certs/${myEnv.MAUTH_PRIVATE_KEY_NAME}`),
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