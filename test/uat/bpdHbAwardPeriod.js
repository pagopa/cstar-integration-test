import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';
import { GetAwardPeriodSuccess } from '../tests/bpdHbAwardPeriod.js';

// export let options = JSON.parse(open('../../options/low_load.json'));
export let options = {};
export let services = JSON.parse(open('../../services/environments.json'));

options.tlsAuth = [
  {
    domains: [services.uat_issuer.baseUrl],
    cert: open('../../certs/cstar_u_test.cert'),
    key: open('../../certs/cstar_u_test.key'),
  }
];

export default () => {

  group('GET Award Period', () => {
    let params = {
      headers: {
        'Ocp-Apim-Subscription-Key': `${__ENV.APIM_SK};product=issuer-api-product`,
        'Ocp-Apim-Trace': 'true'
      }
    }

    group('Should get award periods', () => GetAwardPeriodSuccess(services.uat_issuer.baseUrl, params ) );
  });
}