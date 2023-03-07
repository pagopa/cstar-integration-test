import { group } from 'k6'
import exec from 'k6/execution'
import { createRtdSas } from '../common/api/rtdCsvTransaction.js'
import { assert, statusCreated, statusUnauthorized } from '../common/assertions.js'
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
export let options = {}
let params = {}
let baseUrl_acq
let baseUrl_io
let myEnv

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl_acq = services[`${__ENV.TARGET_ENV}_issuer`].baseUrl
    baseUrl_io  = services[`${__ENV.TARGET_ENV}_io`].baseUrl

    options.tlsAuth = [
        {
            domains: [baseUrl_acq],
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

export default () => {
    group('CSV Transaction API', () => {
        group('Should create RTD SAS uri when called on acquirer listener', () =>
            assert(createRtdSas(baseUrl_acq, params), [statusCreated()])
        )
        group('Should NOT create RTD SAS uri when called on IO listener', () =>
            assert(createRtdSas(baseUrl_io, params), [statusUnauthorized()])
        )
    })
}
