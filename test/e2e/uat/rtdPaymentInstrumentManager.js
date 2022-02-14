import { group } from 'k6';
import {GetHashedPan } from '../../tests/rtdPaymentInstrumentManager.js';

export let options = {}
export let services = JSON.parse(open('../../../services/environments.json'));

options.tlsAuth = [
  { 
    domains: [services.uat_issuer.baseUrl],
    cert: open('../../../certs/cstar_u_test.cert'),
    key: open('../../../certs/cstar_u_test.key'),
  }
];

export default () => {

  group('Payment Instrument API', () => {
    let params = {
      headers: {
        //'Ocp-Apim-Subscription-Key': `${__ENV.APIM_SK};product=issuer-api-product`,
        //'Ocp-Apim-Subscription-Key': `${__ENV.APIM_SK};product=rtd-api-product`,
        'Ocp-Apim-Subscription-Key': `${__ENV.APIM_SK}`,
        'Ocp-Apim-Trace': 'true'
      }
    }

    group('Should get hashed pans', () => GetHashedPan(services.uat_issuer.baseUrl, params) );

  });
}