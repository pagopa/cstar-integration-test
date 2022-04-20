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

const REGISTERED_ENVS = [DEV, UAT]

const services = JSON.parse(open('../../services/environments.json'))

export let options = {
    scenarios: {
        constant_request_rate: {
            executor: 'constant-arrival-rate',
            rate: 50,
            timeUnit: '1s',
            duration: '1m',
            preAllocatedVUs: 100,
            maxVUs: 10000,
        },
    },
    summaryTrendStats: [
        'med',
        'avg',
        'min',
        'max',
        'p(10)',
        'p(20)',
        'p(30)',
        'p(40)',
        'p(50)',
        'p(60)',
        'p(70)',
        'p(80)',
        'p(90)',
    ],
}

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

function chooseRandomPanFromList() {
    const index = randomIntBetween(0, panList.list.length - 1)
    return panList.list[index]
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
        vatNumber: '15376371009',
    }
}

export default () => {
    group('FA Payment Instruments API', () => {
        const pan = chooseRandomPanFromList()
        const fiscalCode = myEnv.FISCAL_CODE_PM_EXISTING
        const body = createBody(pan, fiscalCode)
        group('Should put a FA CUSTOMER', () =>
            assert(putFaCustomer(baseUrl, params, { id: body.fiscalCode }), [
                statusOk(),
            ])
        )
        group('Should create a FA Payment Instrument', () => {
            assert(putFAPaymentInstrumentCard(baseUrl, params, body), [
                statusOk(),
            ])
        })
        group('Should get an FA Payment Instrument', () =>
            assert(
                getFAPaymentInstrument(
                    baseUrl,
                    params,
                    pan.replace(/\n/g, '\\n'),
                    body.fiscalCode
                ),
                [statusOk()]
            )
        )
        group('Should delete a FA Payment Instrument', () => {
            assert(
                deleteFAPaymentInstrument(
                    baseUrl,
                    params,
                    pan.replace(/\n/g, '\\n')
                ),
                [statusNoContent()]
            )
        })
    })
}
