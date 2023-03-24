import { group, sleep} from 'k6'
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
import { setStages } from '../common/stageUtils.js';
import defaultHandleSummaryBuilder from '../common/handleSummaryBuilder.js'

const REGISTERED_ENVS = [DEV, UAT, PROD]

let baseUrl
let cfList = new SharedArray('cfList', function() {
    return getFCList()
})

const services = JSON.parse(open('../../services/environments.json'))

const customStages = setStages(__ENV.VIRTUAL_USERS_ENV, __ENV.DURATION_STAGES, __ENV.MAX_TARGET)
let scenarios = {
    rampingArrivalRate: {
        executor: 'ramping-arrival-rate', //Number of VUs to pre-allocate before test start to preserve runtime resources
        timeUnit: '1s', //period of time to apply the iteration
        preAllocatedVUs: __ENV.VIRTUAL_USERS_ENV,
        maxVUs: __ENV.VIRTUAL_USERS_ENV,
        stages: customStages
    },
    perVuIterations: {
        executor: 'per-vu-iterations',
        vus: __ENV.VIRTUAL_USERS_ENV,
        iterations: 1,
        startTime: '0s',
        maxDuration: `${__ENV.DURATION_PER_VU_ITERATION}s`,
    },
};

export let options = {
    scenarios: {},
    thresholds: {
        http_req_failed: [{threshold:'rate<0.01', abortOnFail: false, delayAbortEval: '10s'},], // http errors should be less than 1%
        http_reqs: [{threshold: `count<=${__ENV.VIRTUAL_USERS_ENV}`, abortOnFail: false, delayAbortEval: '10s'},]
      },
    
}

if (__ENV.SCENARIO_TYPE_ENV) {
    options.scenarios[__ENV.SCENARIO_TYPE_ENV] = scenarios[__ENV.SCENARIO_TYPE_ENV]; // Use just a single scenario if ` -e SCENARIO_TYPE_ENV` is used
} else {
    options.scenarios = scenarios; // Use all scenrios
}

if (isEnvValid(__ENV.TARGET_ENV)) {
    baseUrl = services[`${__ENV.TARGET_ENV}_io`].baseUrl
}

export default () => {
    //MOCK TOKEN
    group('Should pdv put a cf', () => {
        group('Returns a token', () => {

        const uniqueCF = cfList[vu.idInTest-1].FC
            
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
            baseUrl,
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

export const handleSummary = defaultHandleSummaryBuilder(
    'putTokenMockedPdv'
)

