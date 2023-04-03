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
import {exec, vu, scenario} from 'k6/execution'
import {putEnrollIban} from '../common/api/idpayWallet.js'
import { getFCIbanList } from '../common/utils.js'
import { SharedArray } from 'k6/data'
import { jUnit, textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { setStages, setScenarios, buildScenarios, coalesce } from '../common/stageUtils.js';
import defaultHandleSummaryBuilder from '../common/handleSummaryBuilder.js'
   
const REGISTERED_ENVS = [DEV, UAT, PROD]

let cfIbanList = new SharedArray('cfIbanList', function() {
    return getFCIbanList()
})
let baseUrl
const services = JSON.parse(open('../../services/environments.json'))

const customStages = setStages(__ENV.VIRTUAL_USERS_ENV, __ENV.STAGE_NUMBER_ENV > 3 ? __ENV.STAGE_NUMBER_ENV : 3)

const vuIterationsScenario = {
    scenarios: setScenarios(__ENV.VIRTUAL_USERS_ENV, __ENV.VUS_MAX_ENV, __ENV.START_TIME_ENV, __ENV.DURATION_PER_VU_ITERATION),
    thresholds: {
        http_req_failed: [{ threshold: 'rate<0.05', abortOnFail: false, delayAbortEval: '10s' },],
        http_reqs: [{ threshold: `count<=${parseInt(__ENV.VIRTUAL_USERS_ENV) * 6}`, abortOnFail: false, delayAbortEval: '10s' },]
    }
}

let customArrivalRate = {
    rampingArrivalRate: {
        executor: 'ramping-arrival-rate',
        timeUnit: '1s',
        preAllocatedVUs: __ENV.VIRTUAL_USERS_ENV,
        maxVUs: __ENV.VIRTUAL_USERS_ENV,
        stages: customStages
    }
}
// Scenario configuration for rampingArrivalRate
let rampingArrivalRateScenario = {
    scenarios: customArrivalRate,
    thresholds: {
        http_req_failed: [{ threshold: 'rate<0.05', abortOnFail: false, delayAbortEval: '10s' },],
        http_reqs: [{ threshold: `count<=${parseInt(__ENV.VIRTUAL_USERS_ENV) * 6}`, abortOnFail: false, delayAbortEval: '10s' },]
    }
}

let typeScenario
if (__ENV.SCENARIO_TYPE_ENV === 'perVuIterations') {
    typeScenario = vuIterationsScenario
} else if (__ENV.SCENARIO_TYPE_ENV === 'rampingArrivalRate') {
    typeScenario = rampingArrivalRateScenario
} else {
    console.log(`Scenario ${__ENV.SCENARIO_TYPE_ENV} not found`)
}

export let options = typeScenario

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
    let checked = true

    const scenarioBaseIndex = buildScenarios(exec.test.options)
    const cfBaseIndex = coalesce(scenarioBaseIndex[scenario.name], 0)
    let FC = cfIbanList[cfBaseIndex+scenario.iterationInTest].FC
    const cf = auth(FC)

    let iban = cfIbanList[cfBaseIndex+scenario.iterationInTest].IBAN

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

export const handleSummary = defaultHandleSummaryBuilder(
    'ioPutEnrollIban', customStages
)