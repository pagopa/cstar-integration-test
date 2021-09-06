import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';
import { GetCitizenSuccess, GetCitizenNotFound, GetCitizenBadFormat, PutCitizenSuccessV1, GetCitizenV1Success, PatchCitizenV1, PutCitizenSuccessV2} from '../tests/bpdHbCitizens.js';

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

  group('Citizen API', () => {
    let params = {
      headers: {
        'Ocp-Apim-Subscription-Key': `${__ENV.APIM_SK};product=issuer-api-product`,
        'Ocp-Apim-Trace': 'true',
        // 'Host': services.uat_issuer.host
      }
    }

    group('Should enroll a citizen', () => PutCitizenSuccessV2(services.uat_issuer.baseUrl, params, {
      id : 'BPVLMC32T06A429W'
    }));

    group('Should return citizen status V2', () => GetCitizenSuccess(services.uat_issuer.baseUrl, params, 'BPVLMC32T06A429W'));
    group('Should return citizen status V1', () => GetCitizenV1Success(services.uat_issuer.baseUrl, params, 'BPVLMC32T06A429W'));

    group('Should set payoff instrument', () => PatchCitizenV1(services.uat_issuer.baseUrl, params, 'BPVLMC32T06A429W', {
      accountHolderCF: "NROMHL87A10Z336L",
      accountHolderName: "Santi",
      accountHolderSurname: "Licheri",
      payoffInstr: "IT77J0300203280174896364782",
      payoffInstrType: "IBAN",
      //technicalAccountHolder: "string",
      // issuerCardId: "string"
    }));

    group("Shouldn't find citizen", () => GetCitizenNotFound(services.uat_issuer.baseUrl, params, 'PCFLNG75L42F839I'));
    group("Should fail for bad format", () => GetCitizenBadFormat(services.uat_issuer.baseUrl, params, 'FAKEFISCALCODE' ));

  });
}