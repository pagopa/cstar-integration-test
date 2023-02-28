import { group, sleep } from 'k6'
import {
     upsertToken,
     upsertMockToken
    } from '../common/api/pdv.js'
import { assert, statusOk, } from '../common/assertions.js'
import { isEnvValid, DEV, UAT, PROD } from '../common/envs.js'
import { getFCList } from '../common/utils.js'
import { vu } from 'k6/execution'
import { SharedArray } from 'k6/data'
import { jUnit, textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

const REGISTERED_ENVS = [DEV, UAT, PROD]

let baseUrl
let cfList = new SharedArray('cfList', function() {
    return getFCList()
})

const services = JSON.parse(open('../../services/environments.json'))

export let options = {
//    scenarios: {
//        per_vu_iterations: {
//            executor: 'ramping-arrival-rate', //Number of VUs to pre-allocate before test start to preserve runtime resources
//            timeUnit: '1s', //period of time to apply the iteration
//            startRate: 10, //Number of iterations to execute each timeUnit period at test start.
//            preAllocatedVUs: 500,
//            stages: [ //TODO to be parametrized according to the number of VUs
//                { duration: '1s', target: 10 },
//                { duration: '1s', target: 50 },
//                { duration: '1s', target: 10 },
//                { duration: '1s', target: 100 },
//                { duration: '1s', target: 20 },
//                { duration: '1s', target: 300 },
//                { duration: '1s', target: 0 },
//            ]
//        }
    
     scenarios: { //TODO only test scope
        scenario_uno: {
            executor: 'per-vu-iterations',
            vus: __ENV.VIRTUALUSERS_ENV,
            iterations: 1,
            startTime: '0s',
            maxDuration: '600s', //TODO to be parametrized according to the number of VUs
        },
    },
    thresholds: {
        http_req_failed: [{threshold:'rate<0.01', abortOnFail: false, delayAbortEval: '10s'},], // http errors should be less than 1%
//        http_req_duration: [{threshold:'p(90)<500', abortOnFail: false, delayAbortEval: '10s'},], // 90% of requests should be below 200ms
//        http_reqs: [{threshold: `count<=${__ENV.VIRTUALUSERS_ENV}`, abortOnFail: false, delayAbortEval: '10s'},]
      },
    
}

if (isEnvValid(__ENV.TARGET_ENV)) {
    baseUrl = services[`${__ENV.TARGET_ENV}_pdv`].baseUrl
}



export default () => {
    const uniqueCF = cfList[vu.idInTest-1].cf

    //MOCK TOKEN
    group('Should pdv put a cf', () => {
        group('Returns a token', () => {
            
        const params= {
            headers:  { 
                'Content-Type' : 'application/json',
                'Ocp-Apim-Trace': 'true',
            },
            body: {
                "pii": uniqueCF,
            }
        }

        let res = upsertMockToken(
            JSON.stringify(params.body),
            params
        )

        if(res.status != 200){
            console.error('ERROR-> '+JSON.stringify(res))
            return
        }

        assert(res,
            [statusOk()])
        })
    })
    sleep(1)
}

export function handleSummary(data){
    console.log(`
    ****************************************************************\nTEST DETAILS:\n\r- Time to complete test: ${data.state.testRunDurationMs} ms
    - Environment target: ${__ENV.TARGET_ENV}
    - Scenario test type: ${__ENV.SCENARIOTYPE_ENV}
    - Number of VUs: ${__ENV.VIRTUALUSERS_ENV} (OK: ${data.metrics.checks.values.passes} - ERRORS: ${data.metrics.checks.values.fails})
    ****************************************************************`)
    return {
            'stdout': textSummary(data, { indent: ' ', enableColors: true}),
            './performancetest-result.xml': jUnit(data),
    }
}


