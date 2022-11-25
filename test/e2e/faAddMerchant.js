import { group } from 'k6'
import { putMerchantByOther } from '../common/api/faExtMerchant.js'
import { putFaCustomer } from '../common/api/faHbCustomer.js'
import { assert, statusOk } from '../common/assertions.js'
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

export const options = {}
const params = {}
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

export function createMerchantBody(vat) {
    return {
        vatNumber: vat,
        companyName: 'Company test',
        registerAuth: 'register_4',
        registerCode: '00004',
        shops: [
            {
                callId: 1,
                companyAddress: 'Test address 1',
                companyName: 'Test name 1',
                contactEmail: 'test.1@test.test',
                contactName: 'Contact name 1',
                contactSurname: 'Contact surname 1',
                contactTel1: '+39420000000001',
                providerId: 1,
            },
        ],
    }
}

export default () => {
    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        return
    }
    const vat = myEnv.VALID_VAT_NUMBER
    const body = createMerchantBody(vat)
    group('FA add merchant', () => {
        group('Add merchant', () => {
            assert(putMerchantByOther(baseUrl, params, body), [statusOk()])
        })
    })
}
