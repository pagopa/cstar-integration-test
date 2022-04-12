import { group } from 'k6'
import exec from 'k6/execution'
import {
    getFAPaymentInstrument,
    putFAPaymentInstrumentCard,
} from '../common/api/faHbPaymentInstruments.js'
import { assert, statusOk } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, DEV, UAT } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
// import { randomFiscalCode } from '../common/utils.js'

const REGISTERED_ENVS = [DEV, UAT]

const services = JSON.parse(open('../../services/environments.json'))

export let options = {
    scenarios: {
        constant_request_rate: {
            executor: 'constant-arrival-rate',
            rate: 1,
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

const body = {
    id: `-----BEGIN PGP MESSAGE-----
Version: BCPG v1.58

hQEMA5iQxLoVRSHvAQf+NRxLrbsjt/nag5EU/c2XUO8/NRCkY/xqEThAn68ykvWM
cftQaPdf7JIQzXwTbcvYnJXx+lskOsa/lAi4HS2FlyI6H0a5T6WHHVDWmrRyx/cj
UFQ4UgFqAU40gb/95+Zppg6/5C+WqmuDxq3/2cmbUnjggqUMwVZONzKQpFzQZhsa
Bla+5mw3ko+5fsbDiiM2c8raayrco2Ryd1xPqamrYmykpmKwEkZMw9S7RxS20kIc
o7Ne0FuxxG4dRkTk4dvvOwnP1yJvlcgK+idXbdP3QCUVZb8QCWyLf5GFqzTWHkuz
wqSckqBwrSB3XXK1rdLONz6bRqFCsWyS+Ai8566II9JKAYsefrkiCTa4wXV0VlvB
PW8s7wZetE9gExRTed36C0lSG9syxomCoEingcLKd9ohuUR6+TEGQHsDLRWrdc9H
iG3WCNvjXR2Wuq0=
=c+K4
-----END PGP MESSAGE-----`,
    fiscalCode: myEnv.FISCAL_CODE_EXISTING,
    expireYear: '2025',
    exprireMonth: '05',
    issuerAbiCode: '07601',
    brand: 'VISA',
    holder: 'ATM COLLAUDO',
    type: 'CRD',
    channel: '36024',
    vatNumber: '15376371009',
}
//console.log(JSON.stringify(body))
export default () => {
    group('FA Payment Instruments API', () => {
        group('Should create an FA PI CUSTOMER', () =>
            assert(putFAPaymentInstrumentCard(baseUrl, params, body), [
                statusOk(),
            ])
        )
        /* group('Should get an FA PI CUSTOMER', () =>
			assert(getFAPaymentInstrument(baseUrl, params, body.id, body.fiscalCode), [
				statusOk(),
			])
		) */
    })
}
