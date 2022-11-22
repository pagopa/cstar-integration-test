import { group, check} from 'k6'
import {
    getHashedPan,
    getSalt,
} from '../common/api/rtdPaymentInstrumentManager.js'
import { assert, statusOk, bodyLengthBetween } from '../common/assertions.js'
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
    group('Payment Instrument API', () => {
        group('Should get hashed pans', () =>
            assert(getHashedPan(baseUrl, params), [
                statusOk(),
                bodyLengthBetween(0, myEnv.RTD_HASHPAN_MAX_CONTENT_LENGTH),
            ])
        )
        group('Should get salt', () =>
            assert(getSalt(baseUrl, params), [statusOk()])
        )
    })

    group('Payment Instrument API v2', () => {
        group('Should get hashed pans', () =>
            assert(getHashedPan(baseUrl, params, { version: 'v2' }), [
                statusOk(),
                bodyLengthBetween(0, myEnv.RTD_HASHPAN_MAX_CONTENT_LENGTH),
                (res) => 'Last-Modified' in res.headers
            ])
        )
        group('Should get 404 when no hashed pans file found', () => {
            const queryParams = "filePart=1000"
            check(getHashedPan(baseUrl, params, { version: 'v2', queryParams: queryParams }), {
                'Not existing file: is 404': (r) => r.status === 404,
            })
        });
        group('Should get salt', () =>
            assert(getSalt(baseUrl, params, 'v2'), [statusOk()])
        )
    })

    group('Payment Instrument API v3', () => {
        group('Should get hashed pans', () =>
            assert(getHashedPan(baseUrl, params, { version: 'v3' }), [
                statusOk(),
                bodyLengthBetween(0, myEnv.RTD_HASHPAN_MAX_CONTENT_LENGTH),
                (res) => 'Last-Modified' in res.headers
            ])
        )
        group('Should get 404 when no hashed pans file found', () => {
            const queryParams = "filePart=1000"
            check(getHashedPan(baseUrl, params, { version: 'v3', queryParams: queryParams }), {
                'Not existing file: is 404': (r) => r.status === 404,
            })
        });
        group('Should get salt', () =>
            assert(getSalt(baseUrl, params, 'v3'), [statusOk()])
        )
    })
}
