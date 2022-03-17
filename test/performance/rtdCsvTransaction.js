import { group } from 'k6'
import exec from 'k6/execution'
import { createRtdSas, createAdeSas } from '../common/api/rtdCsvTransaction.js'
import { assert, statusCreated } from '../common/assertions.js'
import {
    isEnvValid,
    isTestEnabledOnEnv,
    DEV,
    UAT,
    PROD,
} from '../common/envs.js'
import dotenv from 'k6/x/dotenv'

const REGISTERED_ENVS = [DEV, UAT, PROD]

const services = JSON.parse(open('../../services/environments.json'))
export let options = {
    stages: [
        { duration: '1m', target: 10 },
        { duration: '3m', target: 30 },
        { duration: '1m', target: 10 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
    },
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
    }
}

// In performance tests we shall use abort() to prevent the execution
// of the default function, otherwise the VUs will be spawned
if (!isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)) {
    console.log('Test not enabled for target env')
    exec.test.abort()
}

export default () => {
    group('CSV Transaction API', () => {
        group('Should create RTD SAS', () =>
            assert(createRtdSas(services.dev_issuer.baseUrl, params), [
                statusCreated(),
            ])
        )
        group('Should create AdE SAS', () =>
            assert(createAdeSas(services.dev_issuer.baseUrl, params), [
                statusCreated(),
            ])
        )
    })
}
