import { group, sleep } from 'k6'
import { createTransaction,
    preAuth,
    authTrx
} from '../common/api/idPayPaymentDiscount.js'
import { loginFullUrl } from '../common/api/bpdIoLogin.js'
import { assert, statusCreated, statusOk} from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, DEV, UAT, PROD } from '../common/envs.js'
import { getFCList } from '../common/utils.js'
import { scenario } from 'k6/execution'
import exec from 'k6/execution'
import { SharedArray } from 'k6/data'
import { setStages, setScenarios, thresholds } from '../common/stageUtils.js';
import defaultHandleSummaryBuilder from '../common/handleSummaryBuilder.js'

const REGISTERED_ENVS = [DEV, UAT, PROD]

const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let trxCode
let cfList = new SharedArray('cfList', function () {
    return getFCList()
})

const customStages = setStages(__ENV.VUS_MAX_ENV, __ENV.STAGE_NUMBER_ENV > 3 ? __ENV.STAGE_NUMBER_ENV : 3)

const vuIterationsScenario = {
    scenarios: setScenarios(__ENV.VIRTUAL_USERS_ENV, __ENV.VUS_MAX_ENV, __ENV.START_TIME_ENV, __ENV.DURATION_PER_VU_ITERATION, __ENV.ONE_SCENARIO),
    thresholds: thresholds(__ENV.VUS_MAX_ENV, 4)
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
    thresholds: thresholds(__ENV.VUS_MAX_ENV, 4)
}
let customConstantArrivalRate = {
    constantArrivalRate: {
        executor: 'constant-arrival-rate',
        duration: `${__ENV.DURATION_PER_VU_ITERATION}s`,
        rate: __ENV.RATE,
        timeUnit: '1s',
        preAllocatedVUs: Math.ceil(0.01 * __ENV.VUS_MAX_ENV),
        maxVUs: __ENV.VUS_MAX_ENV
    }
}

// Scenario configuration for constantArrivalRate
let rampingConstantArrivalRateScenario = {
    scenarios: customConstantArrivalRate,
    thresholds: thresholds(__ENV.VUS_MAX_ENV, 4)
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
    let checked = true
    const scenarioBaseIndex = buildScenarios(exec.test.options)
    const cfBaseIndex = coalesce(scenarioBaseIndex[scenario.name], 0)
    let FC = cfList[cfBaseIndex + scenario.iterationInTest].FC

    const cf = auth(FC)

    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        exec.test.abort()
    }
    group ('Create Transaction', () => {
        if (checked) {

            const params = {
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key': `${__ENV.APIM_SK}`,
                    'Ocp-Apim-Trace': 'true',
                    'x-merchant-id' : `${__ENV.MERCHANT_ID}`,
                    'x-acquirer-id' : 'PAGOPA',
                    'x-apim-request-id' : 'Test k6'
                },
                body: {
                    "initiativeId" : `${__ENV.INITIATIVE_ID}`,
                    "idTrxAcquirer" : `IDTRXACQUIRER${Math.random()}`,
                    "amountCents" : "100",
                    "mcc" : `MCC${Math.random}`

                }
            }

            let res = createTransaction(
                baseUrl,
                JSON.stringify(params.body),
                params.headers
            )

            assert(res, [statusCreated()])
            if (res.status != 201) {
                console.error('Create Trx -> ' + JSON.stringify(res))
                checked = false
                return
            }

            const bodyObj = JSON.parse(res.body)
            trxCode = bodyObj.id
        }
    })
    group ('Pre Auth Transaction', () => {
        if (checked) {

            let res = preAuth(
                baseUrl, 
                cf, 
                trxCode
            )

            assert(res, [statusOk()])
            if (res.status != 200) {
                console.error('preAuth -> ' + JSON.stringify(res))
                checked = false
                return
            }
        }
    })
    group ('Auth Transaction', () => {
        if (checked) {

            let res = authTrx(
                baseUrl, 
                cf, 
                trxCode
            )

            assert(res, [statusOk()])
            if (res.status != 200) {
                console.error('Auth -> ' + JSON.stringify(res))
                checked = false
                return
            }
        }
    })
}

export const handleSummary = defaultHandleSummaryBuilder(
    'idpayPaymentDiscountAPI', customStages
)