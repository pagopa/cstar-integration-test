import { group } from 'k6'
import exec from 'k6/execution'
import { getFaCustomer, putFaCustomer } from '../common/api/faHbCustomer.js'
import { assert, statusOk } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, DEV, UAT } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { randomFiscalCode } from '../common/utils.js'

const REGISTERED_ENVS = [DEV, UAT]

const services = JSON.parse(open('../../services/environments.json'))

export let options = JSON.parse(open('../../options/constant_load.json'))

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

export function createCustomerBody() {
    return {
        id: randomFiscalCode(),
    }
}

export function createCustomerTest(baseUrl, params, body) {
    assert(putFaCustomer(baseUrl, params, body), [statusOk()])
}

export function getCustomerTest(baseUrl, params, id) {
    assert(getFaCustomer(baseUrl, params, id), [statusOk()])
}

export default () => {
    group('FA HB Customer API', () => {
        const body = createCustomerBody()

        group('Should create an FA CUSTOMER', () =>
            createCustomerTest(baseUrl, params, body)
        )
        group('Should get an FA CUSTOMER', () =>
            getCustomerTest(baseUrl, params, body.id)
        )
    })
}
