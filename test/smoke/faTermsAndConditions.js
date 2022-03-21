import { group } from 'k6'
import {
    getFaTermsAndConditionsViaBlob,
    getFaTermsAndConditionsHtml,
    getFaTermsAndConditionsPdf,
} from '../common/api/faTc.js'
import { assert, statusOk, statusConflict } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, DEV } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'

const REGISTERED_ENVS = [DEV]

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
        'Ocp-Apim-Subscription-Key': myEnv.APIM_SK,
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
    group('GET Award Period', () => {
        group('Should get BPD T&C via Blob Get', () =>
            assert(getFaTermsAndConditionsViaBlob(baseUrl, params), [
                statusConflict(),
            ])
        )
        group('Should get BPD T&C HTML via dedicated API', () =>
            assert(getFaTermsAndConditionsHtml(baseUrl, params), [statusOk()])
        )
        group('Should get BPD T&C PDF via dedicated API', () =>
            assert(getFaTermsAndConditionsPdf(baseUrl, params), [statusOk()])
        )
    })
}
