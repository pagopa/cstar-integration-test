import { group, sleep } from 'k6'
import { assert, statusOk} from '../common/assertions.js'
import {
    isEnvValid,
    isTestEnabledOnEnv,
    DEV,
    UAT,
    PROD,
} from '../common/envs.js'
import { loginFullUrl } from '../common/api/bpdIoLogin.js'
import {exec, vu} from 'k6/execution'
import {putEnrollIban} from '../common/api/idpayWallet.js'
import { getFCIbanList } from '../common/utils.js'
import { SharedArray } from 'k6/data'
import { jUnit, textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { setStages } from '../common/stageUtils.js';
   
const REGISTERED_ENVS = [DEV, UAT, PROD]

let cfIbanList = new SharedArray('cfIbanList', function() {
    return getFCIbanList()
})
let baseUrl
const services = JSON.parse(open('../../services/environments.json'))

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
        http_reqs: [{threshold: `count<=${parseInt(__ENV.VIRTUAL_USERS_ENV) * 2}`, abortOnFail: false, delayAbortEval: '10s'},]
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

function auth(fiscalCode) {
    const authToken = loginFullUrl(
        `${baseUrl}/bpd/pagopa/api/v1/login`,
        fiscalCode
    )
    return {
        headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': `${__ENV.APIM_SK}`,
            'Ocp-Apim-Trace': 'true'
        },
    }
}


export default () => {
    const cf = auth(cfIbanList[vu.idInTest-1].FC)
    const iban = cfIbanList[vu.idInTest-1].IBAN

    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        exec.test.abort()
    }

    group('Iban API', () => {
        group('Should enroll iban', () =>{

        let initiativeId = `${__ENV.INITIATIVE_ID}`
        let body= {
            "iban": iban,
            "description": `conto cointestato`
        }

        let res = putEnrollIban(
            baseUrl,
            initiativeId,
            cf,
            JSON.stringify(body))

        if(res.status != 200){
            console.error('Enrollment IBAN-> '+JSON.stringify(res))
            return
        }

        assert(res, [statusOk()])

        })
    })
    sleep(1)
}

export function handleSummary(data){
    console.log(`TEST DETAILS: [Time to complete test: ${data.state.testRunDurationMs} ms, Environment target: ${__ENV.TARGET_ENV}, Scenario test type: ${__ENV.SCENARIO_TYPE_ENV}, Number of VUs: ${__ENV.VIRTUAL_USERS_ENV}, Request processed: ${data.metrics.http_reqs.values.count}, Request OK: ${data.metrics.http_req_failed.values.fails}, ERRORS: ${data.metrics.http_req_failed.values.passes}]`)
    if(__ENV.SCENARIO_TYPE_ENV == 'rampingArrivalRate'){
        let stringRamping = 'Ramping iterations for stage : { '
        for(let i=0; i<customStages.length-1; i++){
            stringRamping += `${customStages[i].target}, `
        }
        console.log(stringRamping+ `${customStages[customStages.length-1].target} } `)
    }
    return {
            'stdout': textSummary(data, { indent: ' ', enableColors: true}),
            './performancetest-result.xml': jUnit(data),
    }
}