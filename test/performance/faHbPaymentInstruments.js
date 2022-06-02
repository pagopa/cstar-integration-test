import { group } from 'k6'
import exec from 'k6/execution'
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js'
import {
    getFAPaymentInstrument,
    putFAPaymentInstrumentCard,
    deleteFAPaymentInstrument,
} from '../common/api/faHbPaymentInstruments.js'
import { putFaCustomer } from '../common/api/faHbCustomer.js'
import { assert, statusOk, statusNoContent } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, DEV, UAT } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { randomFiscalCode } from '../common/utils.js'

const REGISTERED_ENVS = [DEV, UAT]

const services = JSON.parse(open('../../services/environments.json'))

export let options = JSON.parse(open('../../options/constant_load.json'))

let params = {}
let baseUrl
let myEnv
let panList = []

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_issuer`].baseUrl
    panList = JSON.parse(open('../../assets/encrypted_pan_list.json'))

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

export function chooseRandomPanFromList(panList) {
    const index = randomIntBetween(0, panList.list.length - 1)
    return panList.list[index]
}

export function createPaymentInstrumentBody(encrPan, fiscalCode) {
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
        vatNumber: '15376371009',
    }
}

export function putPaymentInstrumentCardTest(baseUrl, params, body) {
    assert(putFAPaymentInstrumentCard(baseUrl, params, body), [statusOk()])
}

export function getPaymentInstrumentCardTest(baseUrl, params, pan, fiscalCode) {
    assert(
        getFAPaymentInstrument(
            baseUrl,
            params,
            pan.replace(/\n/g, '\\n'),
            fiscalCode
        ),
        [statusOk()]
    )
}

export function deletePaymentInstrumentCardTest(baseUrl, params, pan) {
    assert(
        deleteFAPaymentInstrument(baseUrl, params, pan.replace(/\n/g, '\\n')),
        [statusNoContent()]
    )
}

export default () => {
    group('FA Payment Instruments API', () => {
        const pan = chooseRandomPanFromList(panList)
        const fiscalCode = randomFiscalCode().toUpperCase()
        const body = createPaymentInstrumentBody(pan, fiscalCode)
        group('Should put a FA CUSTOMER', () =>
            assert(putFaCustomer(baseUrl, params, { id: fiscalCode }), [
                statusOk(),
            ])
        )
        group('Should create a FA Payment Instrument', () => {
            putPaymentInstrumentCardTest(baseUrl, params, body)
        })
        group('Should get an FA Payment Instrument', () =>
            getPaymentInstrumentCardTest(baseUrl, params, pan, fiscalCode)
        )
        group('Should delete a FA Payment Instrument', () => {
            deletePaymentInstrumentCardTest(baseUrl, params, pan)
        })
    })
}
