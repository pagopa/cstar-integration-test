import { group } from 'k6'
import exec from 'k6/execution'
import { sogeiHealthCheck } from '../common/api/cdcSogeiHealthCheck.js'
import { assert, statusOk } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, UAT } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'

const REGISTERED_ENVS = [UAT]

const services = JSON.parse(open('../../services/environments.json'))

export let options = {
    scenarios: {
        constant_request_rate: {
            executor: 'constant-arrival-rate',
            rate: 1000,
            timeUnit: '1s',
            duration: '1m',
            preAllocatedVUs: 100,
            maxVUs: 10000,
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

let params = {}
let baseUrl
let myEnv

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_issuer`].baseUrl

    options.tlsAuth = [
        {
            domains: [baseUrl],
            cert: open(`../../certs/${myEnv.MAUTH_CERT_NAME}`),
            key: open(`../../certs/${myEnv.MAUTH_PRIVATE_KEY_NAME}`),
        },
    ]

    params.headers = {
        'Ocp-Apim-Subscription-Key': myEnv.APIM_SK,
        'Ocp-Apim-Trace': 'true',
        'Content-Type': 'application/json',
    }
}

// In performance tests we shall use abort() to prevent the execution
// of the default function, otherwise the VUs will be spawned
if (!isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)) {
    console.log('Test not enabled for target env')
    exec.test.abort()
}

export default () => {
    group('SOGEI CdC', () => {
        group('Should GET HealthCheck', () =>
            assert(sogeiHealthCheck(baseUrl, params), [statusOk()])
        )
    })
}
