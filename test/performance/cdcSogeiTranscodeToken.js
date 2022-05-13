import { group } from 'k6'
import exec from 'k6/execution'
import { sogeiHealthCheck } from '../common/api/cdcSogeiHealthCheck.js'
import { loginFullUrl } from '../common/api/bpdIoLogin.js'
import { assert, statusOk } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, UAT } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'

const REGISTERED_ENVS = [UAT]

export let options = {
    scenarios: {
        constant_request_rate: {
            executor: 'constant-arrival-rate',
            rate: 100,
            timeUnit: '1s',
            duration: '30s',
            preAllocatedVUs: 1,
            maxVUs: 100,
        },
    },
    summaryTrendStats: [
        'med',
        'avg',
        'min',
        'max',
        'p(10)',
        'p(20)',
        'p(30)',
        'p(40)',
        'p(50)',
        'p(60)',
        'p(70)',
        'p(80)',
        'p(90)',
    ],
}


const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let myEnv


if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_io`].baseUrl
}

export function setup() {
    const authToken = loginFullUrl(`${baseUrl}/bpd/pagopa/api/v1/login`, myEnv.FISCAL_CODE_EXISTING)
    return {
        headers: {
            Authorization: `Bearer ${authToken}`,
            'Ocp-Apim-Subscription-Key': `${myEnv.APIM_SK};product=app-io-product`,
            'Ocp-Apim-Trace': 'true',
        },
    }
}

export default (params) => {
    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        return
    }
    group('SOGEI CdC', () => {
        group('Should GET HealthCheck', () =>
            assert(sogeiHealthCheck(baseUrl, params), [statusOk()])
        )
    })
}