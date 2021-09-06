import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';
import { GetBpdIoPaymentInstrumentSuccess, GetBpdIoPaymentInstrumentAuthError, PutBpdPaymentInstrument } from '../tests/bpdIoPaymentInstruments.js';

// export let options = JSON.parse(open('../../options/low_load.json'));
export let options = {};
export let services = JSON.parse(open('../../services/environments.json'));

export function setup() {


  let myUrl = new URL(`${services.uat_io.baseUrl}/bpd/pagopa/api/v1/login`);
  myUrl.searchParams.append('fiscalCode', 'FDNSMN68H15L424O');
  // Get an Auth Token
  console.log(myUrl.toString())
  let res = http.post(myUrl.toString(), {});

  check(res, { 'Received JWT': (r) => r.status === 200 });
  return res.body;
}

export default (authToken) => {

  group('Payment Instrument API', () => {
    let params = {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Ocp-Apim-Subscription-Key': `${__ENV.APIM_SK};product=app-io-product`,
        // Host: services.uat_io.host,
        'Ocp-Apim-Trace': 'true'
      }
    }

    group('Should get payment instrument', () => GetBpdIoPaymentInstrumentSuccess(services.uat_io.baseUrl, params, '934cfb8802a61f21e04ad68231a6700b9efcdf206584241b1030c94f1acb3991') );
    group('Should get an auth error', () => GetBpdIoPaymentInstrumentAuthError(services.uat_io.baseUrl, params, '1bfb1e71c808e92e6f351dadda5257c3259ee7928855cc66be3eded196221bbd'));
    group('Should enroll a card', () => PutBpdPaymentInstrument(services.uat_io.baseUrl, params, {
      
        id:"-----BEGIN PGP MESSAGE-----\n\nhQEMA5iQxLoVRSHvAQf+NRxLrbsjt/nag5EU/c2XUO8/NRCkY/xqEThAn68ykvWM\ncftQaPdf7JIQzXwTbcvYnJXx+lskOsa/lAi4HS2FlyI6H0a5T6WHHVDWmrRyx/cj\nUFQ4UgFqAU40gb/95+Zppg6/5C+WqmuDxq3/2cmbUnjggqUMwVZONzKQpFzQZhsa\nBla+5mw3ko+5fsbDiiM2c8raayrco2Ryd1xPqamrYmykpmKwEkZMw9S7RxS20kIc\no7Ne0FuxxG4dRkTk4dvvOwnP1yJvlcgK+idXbdP3QCUVZb8QCWyLf5GFqzTWHkuz\nwqSckqBwrSB3XXK1rdLONz6bRqFCsWyS+Ai8566II9JKAYsefrkiCTa4wXV0VlvB\nPW8s7wZetE9gExRTed36C0lSG9syxomCoEingcLKd9ohuUR6+TEGQHsDLRWrdc9H\niG3WCNvjXR2Wuq0=\n=c+K4\n-----END PGP MESSAGE-----\n",
        // "fiscalCode": "PYVMPP54R57B436M",
      
        fiscalCode: "PYVMPP54R57B436M",
        expireYear: "2025",
        exprireMonth: "05",
        issuerAbiCode: "07601",
        brand: "VISA",
        holder: "ATM COLLAUDO",
        type: "CRD",
        channel: "65406"
    
    }));
  });
}