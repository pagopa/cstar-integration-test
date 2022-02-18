import { group } from 'k6';
import { GetAdeSas, GetRtdSas } from '../../tests/rtdCsvTransactionDecrypted.js';
import dotenv from 'k6/x/dotenv';

export let options = {};
export let services = JSON.parse(open('../../../services/environments.json'));

// open is only available in global scope
const myEnv = dotenv.parse(open(".env.development.local"));

// patch options
options.tlsAuth = [
  {
    domains: [services.dev_issuer.baseUrl],
    cert: open(`../../../certs/${myEnv.MAUTH_CERT_NAME}`),
    key: open(`../../../certs/${myEnv.MAUTH_PRIVATE_KEY_NAME}`),
  }
];

export default () => {

  group('CSV Transaction Decrypted API', () => {
    let params = {
      headers: {
        'Ocp-Apim-Subscription-Key': `${myEnv.APIM_SK}`,
        'Ocp-Apim-Trace': 'true'
      }
    }

    group('Should get AdE SAS', () => GetAdeSas(services.dev_issuer.baseUrl, params));
    group('Should get RTD SAS', () => GetRtdSas(services.dev_issuer.baseUrl, params));

  })
}
