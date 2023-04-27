import { group, sleep } from 'k6'
import { assert, statusOk } from '../common/assertions.js'
import {
    isEnvValid,
    isTestEnabledOnEnv,
    DEV,
    UAT,
    PROD,
} from '../common/envs.js'
import { scenario, vu } from 'k6/execution'
import exec from 'k6/execution'
import { putEnrollInstrumentIssuer } from '../common/api/idpayWallet.js'
import { getFCPanList } from '../common/utils.js'
import { SharedArray } from 'k6/data'
import { jUnit, textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { setStages, setScenarios, thresholds } from '../common/stageUtils.js';
import defaultHandleSummaryBuilder from '../common/handleSummaryBuilder.js'

const REGISTERED_ENVS = [DEV, UAT, PROD]

const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let cfPanList = new SharedArray('cfPanList', function () {
    return getFCPanList()
})

const customStages = setStages(__ENV.VUS_MAX_ENV, __ENV.DURATION_STAGES, __ENV.MAX_TARGET)

const vuIterationsScenario = {
    scenarios: setScenarios(__ENV.VIRTUAL_USERS_ENV, __ENV.VUS_MAX_ENV, __ENV.START_TIME_ENV, __ENV.DURATION_PER_VU_ITERATION, __ENV.ONE_SCENARIO),
    thresholds: thresholds(__ENV.VUS_MAX_ENV)
}

let customArrivalRate = {
    rampingArrivalRate: {
        executor: 'ramping-arrival-rate',
        timeUnit: '1s',
        preAllocatedVUs: __ENV.VUS_MAX_ENV,
        maxVUs: __ENV.VUS_MAX_ENV,
        stages: customStages
    }
}
// Scenario configuration for rampingArrivalRate
let rampingArrivalRateScenario = {
    scenarios: customArrivalRate,
    thresholds: thresholds(__ENV.VUS_MAX_ENV)
}

let customConstantArrivalRate = {
    constantArrivalRate: {
        executor: 'constant-arrival-rate',
        duration: `${__ENV.DURATION_PER_VU_ITERATION}s`,
        rate: __ENV.RATE,
        timeUnit: '1s',
        preAllocatedVUs: __ENV.VUS_MAX_ENV,
        maxVUs: __ENV.VUS_MAX_ENV
    }
}

// Scenario configuration for constantArrivalRate
let rampingConstantArrivalRateScenario = {
    scenarios: customConstantArrivalRate,
    thresholds: thresholds(__ENV.VUS_MAX_ENV)
}

let typeScenario
if (__ENV.SCENARIO_TYPE_ENV === 'perVuIterations') {
    typeScenario = vuIterationsScenario
} else if (__ENV.SCENARIO_TYPE_ENV === 'rampingArrivalRate') {
    typeScenario = rampingArrivalRateScenario
} else if (__ENV.SCENARIO_TYPE_ENV === 'constantArrivalRate') {
    typeScenario = rampingConstantArrivalRateScenario
} else {
    console.log(`Scenario ${__ENV.SCENARIO_TYPE_ENV} not found`)
}

export let options = typeScenario

if (isEnvValid(__ENV.TARGET_ENV)) {
    baseUrl = services[`${__ENV.TARGET_ENV}_io`].baseUrl
}

function buildScenarios(options) {
    let counter = 0
    const scenarioBaseIndexes = {}

    Object.keys(options.scenarios)
        .filter(scenarioName => scenarioName.startsWith('scenario_'))
        .sort()
        .forEach(scenarioName => {
            const singleScenario = options.scenarios[scenarioName]
            let scenarioBaseIndex = counter
            counter += singleScenario.vus
            scenarioBaseIndexes[scenarioName] = scenarioBaseIndex
        })
    return scenarioBaseIndexes
}

function coalesce(o1, o2) {
    return o1 ? o1 : o2
}

export default () => {
    const scenarioBaseIndex = buildScenarios(exec.test.options)
    const cfBaseIndex = coalesce(scenarioBaseIndex[scenario.name], 0)
    let cf = cfPanList[cfBaseIndex + scenario.iterationInTest].FC

    const pgpan = cfPanList[cfBaseIndex + scenario.iterationInTest].PGPPAN

    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        exec.test.abort()
    }

    group('Payment Instrument API', () => {
        group('Should enroll pgpan', () => {

            let initiativeId = `${__ENV.INITIATIVE_ID}`
            const params = {
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key': `${__ENV.APIM_SK}`,
                    'Ocp-Apim-Trace': 'true',
                    'Accept-Language': 'it_IT',
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

            if (res.status != 200) {
                console.error('Enrollment Carte-> ' + JSON.stringify(res))
                return
            }

            assert(res, [statusOk()])

        })
    })
    sleep(1)

}

export const handleSummary = defaultHandleSummaryBuilder(
    'ioPutEnrollInstrumentIssuer', customStages
)