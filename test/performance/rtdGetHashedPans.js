import { group, sleep } from 'k6'
import { getHashedPan } from '../common/api/rtdPaymentInstrumentManager.js'
import { assert, statusOk, bodyLengthBetween } from '../common/assertions.js'
import {
    isEnvValid,
    isTestEnabledOnEnv,
    DEV,
    UAT,
    PROD,
} from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import exec from 'k6/execution'

const REGISTERED_ENVS = [DEV, UAT, PROD]

const services = JSON.parse(open('../../services/environments.json'))
export let options = {
    stages: [
        { duration: '1m', target: 3 },
        { duration: '3m', target: 6 },
        { duration: '1m', target: 3 },
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
        'Ocp-Apim-Subscription-Key': myEnv.APIM_RTDPRODUCT_SK,
    }
}

// In performance tests we shall use abort() to prevent the execution
// of the default function, otherwise the VUs will be spawned
if (!isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)) {
    console.log('Test not enabled for target env')
    exec.test.abort()
}

export function getHashedPanTest(baseUrl, params) {
    assert(getHashedPan(baseUrl, params), [
        statusOk(),
        bodyLengthBetween(0, myEnv.RTD_HASHPAN_MAX_CONTENT_LENGTH),
    ])
}

export default () => {
    group('Payment Instrument API', () => {
        group('Should get hashed pans', () => getHashedPanTest(baseUrl, params))
    })

    sleep(1)
}
