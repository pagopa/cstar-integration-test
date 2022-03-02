import { group } from 'k6';
import { GetHashedPan, GetSalt } from '../../tests/rtdPaymentInstrumentManager.js';
import dotenv from 'k6/x/dotenv';

export let options = {};
export let services = JSON.parse(open('../../../services/environments.json'));

// open is only available in global scope
const myEnv = dotenv.parse(open(".env.test.local"));

// patch options
options.tlsAuth = [
  {
    domains: [services.uat_issuer.baseUrl],
    cert: open(`../../../certs/${myEnv.MAUTH_CERT_NAME}`),
    key: open(`../../../certs/${myEnv.MAUTH_PRIVATE_KEY_NAME}`),
  }
];

export default () => {

  group('Payment Instrument API', () => {
    let params = {
      headers: {
        'Ocp-Apim-Subscription-Key': myEnv.APIM_RTDPRODUCT_SK,
        'Ocp-Apim-Trace': 'true'
      }
    }

    let getHashedPanOpts = {
      maxContentLength: myEnv.RTD_HASHPAN_MAX_CONTENT_LENGTH
    }
    group('Should get hashed pans', () => GetHashedPan(services.uat_issuer.baseUrl, params, getHashedPanOpts));
    group('Should get salt', () => GetSalt(services.uat_issuer.baseUrl, params));

  })
}
