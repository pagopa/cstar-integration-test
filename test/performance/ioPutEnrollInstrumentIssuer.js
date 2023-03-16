import { group, sleep } from 'k6'
import { assert, statusOk} from '../common/assertions.js'
import {
    isEnvValid,
    isTestEnabledOnEnv,
    DEV,
    UAT,
    PROD,
} from '../common/envs.js'
import {exec, vu} from 'k6/execution'
import {
    putEnrollInstrumentIssuer
   } from '../common/api/idpayWallet.js'
import { getFCPanList } from '../common/utils.js'
import { SharedArray } from 'k6/data'
import { jUnit, textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { setStages } from '../common/stageUtils.js';
import defaultHandleSummaryBuilder from '../common/handleSummaryBuilder.js'

const REGISTERED_ENVS = [DEV, UAT, PROD]

const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let cfPanList = new SharedArray('cfPanList', function() {
    return getFCPanList()
})

const customStages = setStages(__ENV.VIRTUAL_USERS_ENV, __ENV.STAGE_NUMBER_ENV > 3 ? __ENV.STAGE_NUMBER_ENV : 3)


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
    scenarios: {} ,
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
    const cf = cfPanList[vu.idInTest-1].FC
    const pgpan = cfPanList[vu.idInTest-1].PGPPAN

    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        exec.test.abort()
    }

    group('Payment Instrument API', () => {
        group('Should enroll pgpan', () =>{

        let initiativeId = `${__ENV.INITIATIVE_ID}`
        const params= {
            headers:  {
                'Content-Type' : 'application/json',
                'Ocp-Apim-Subscription-Key':`${__ENV.APIM_SK}`,
                'Ocp-Apim-Trace':'true',
                'Accept-Language':'it_IT',
                'Fiscal-Code': cf,
            },
            body: {
                "brand": "VISA",
                "type": "DEB",
                "pgpPan": pgpan,
                "expireMonth": "08",
                "expireYear": "2028",
                "issuerAbiCode": "03069",
                "holder": "TEST"
            }
        }

        let res = putEnrollInstrumentIssuer(
            baseUrl,
            JSON.stringify(params.body).replace(/\\\\/g, "\\"),
            params.headers,
            initiativeId)

        if(res.status != 200){
            console.error('Enrollment Carte-> '+JSON.stringify(res))
            return
        }

        assert(res,[statusOk()])

        })
    })
    sleep(1)

}

export const handleSummary = defaultHandleSummaryBuilder(
    'ioPutEnrollInstrumentIssuer'
)