import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',

      // test duration
      duration: '5m',

      // test rate
      rate: 300,

      // It should start `rate` iterations per second
      timeUnit: '1s',

      // pre-allocate vu
      preAllocatedVUs: 300,

      // max allowed vu
      maxVUs: 600,
    },
  },
};

const throttling = new Counter('throttling');
const services = JSON.parse(open('../../services/environments.json'))
let baseUrl

const random = (length = 8) => {
    // Declare all characters
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    // Pick characters randomly
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;

};

export default function () {

  baseUrl = services[`${__ENV.TARGET_ENV}_pdv`].baseUrl
  var apiKey = `${__ENV.APIM_SK}`


  var params = {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
  };

  var payload = JSON.stringify(
    {
        'pii': random(4)
    }
);

  var r = http.put(baseUrl, payload, params);

  if(r.status != 200){
    console.error('ERROR-> '+JSON.stringify(r))
    return
}

  check(r, {
    'status is 200': (r) => r.status === 200,
  });

  if (r.status === 429) {
    throttling.add(1);
  }

}