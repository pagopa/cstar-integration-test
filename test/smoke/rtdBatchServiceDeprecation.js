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
    statusForbidden,
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
        'Ocp-Apim-Subscription-Key': myEnv.APIM_RTDPRODUCT_SK
    }
}

export default () => {
    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        return
    }
    group('Public Key API', () => {
        group('Batch service minimum version returns OK', () => {
            params.headers['User-Agent'] = 'BatchService/1.2.5'
            assert(getPublicKey(baseUrl, params), [
                statusOk(),
                bodyPgpPublicKey(),
            ])
        })
        group('Batch service next major version returns OK', () => {
            params.headers['User-Agent'] = 'BatchService/2.0.0'
            assert(getPublicKey(baseUrl, params), [
                statusOk(),
                bodyPgpPublicKey(),
            ])
        })
        group('Batch service deprecated version returns 403', () => {
            params.headers['User-Agent'] = 'BatchService/1.2.0'
            assert(getPublicKey(baseUrl, params), [
                statusForbidden()
            ])
        })
        group('Batch service previous major returns 403', () => {
            params.headers['User-Agent'] = 'BatchService/0.9.0'
            assert(getPublicKey(baseUrl, params), [
                statusForbidden()
            ])
        })
        group('User-Agent different from batch service returns OK', () => {
            // header not used by batch service
            params.headers['User-Agent'] = 'PostmanRuntime/7.30'
            assert(getPublicKey(baseUrl, params), [
                statusOk(),
                bodyPgpPublicKey()
            ])
        })
    })
}
