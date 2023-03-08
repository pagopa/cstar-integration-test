import { group } from 'k6'
import {
    getPublicKey,
    createAdeSas,
    createRtdSas,
} from '../common/api/rtdCsvTransaction.js'
import {
    assert,
    statusOk,
    statusCreated,
    statusUnauthorized,
    bodyPgpPublicKey,
} from '../common/assertions.js'
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
let baseUrl
let baseUrl_io
let myEnv

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_issuer`].baseUrl
    baseUrl_io = services[`${__ENV.TARGET_ENV}_io`].baseUrl

    options.tlsAuth = [
        {
            domains: [baseUrl],
            cert: open(`../../certs/${myEnv.MAUTH_CERT_NAME}`),
            key: open(`../../certs/${myEnv.MAUTH_PRIVATE_KEY_NAME}`),
        },
    ]

    params.headers = {
        'Ocp-Apim-Subscription-Key': myEnv.APIM_RTDPRODUCT_SK,
        'Ocp-Apim-Trace': 'true',
    }
}

export default () => {
    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        return
    }
    group('CSV Transaction API', () => {
        group('Should get public key', () =>
            assert(getPublicKey(baseUrl, params), [
                statusOk(),
                bodyPgpPublicKey(),
            ])
        )
        group('Should create AdE SAS', () =>
            assert(createAdeSas(baseUrl, params), [statusCreated()])
        )
        group('Should create RTD SAS', () =>
            assert(createRtdSas(baseUrl, params), [statusCreated()])
        )
        group('Should not get public key through IO listener', () =>
            assert(getPublicKey(baseUrl_io, params), [statusUnauthorized()])
        )
    })
}
