import { group } from 'k6'
import { putFAPaymentInstrumentCard } from '../common/api/faHbPaymentInstruments.js'
import { putFaCustomer } from '../common/api/faHbCustomer.js'
import { assert, statusOk, statusNoContent } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, DEV, UAT } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'

const REGISTERED_ENVS = [DEV, UAT]

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

function createBody(encrPan, fiscalCode) {
    return {
        id: encrPan,
        fiscalCode: fiscalCode,
        expireYear: '2025',
        exprireMonth: '05',
        issuerAbiCode: '07601',
        brand: 'VISA',
        holder: 'ATM COLLAUDO',
        type: 'CRD',
        channel: '36024',
        // vatNumber: '15376371009', not used by payment manager
    }
}

function printHashPan(response) {
    if (response && response.status === 200 && response.body !== '') {
        const bodyObj = JSON.parse(response.body)
        console.log('HASHED PAN: ', bodyObj.hpan)
    }
}

export default () => {
    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        return
    }
    const pan = myEnv.ENCRYPTED_PAN.toString()
    const body = createBody(pan, myEnv.FISCAL_CODE_EXISTING)
    group('FA add customer with a card', () => {
        group('Add Customer and after add card', () => {
            assert(putFaCustomer(baseUrl, params, { id: body.fiscalCode }), [
                statusOk(),
            ])
            const res = putFAPaymentInstrumentCard(baseUrl, params, body)
            printHashPan(res)
            assert(res, [statusOk()])
        })
    })
}
