import { group } from 'k6'
import exec from 'k6/execution'
import {
    getFaPICustomer,
    putFaPICustomerByCard,
    patchFaPICustomer,
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
hQEMA+NENQPn0iNJAQf/YZsCVPWggIu4kQjENH2aenp80tTH+rCAMComNfIZMmUQ
FXRil34Lx0Z4+GHd2Ws1Fx4c+2lh1VeKzrmKljeihMCVO9ItQws2MaWp12Y+eBLu
TPXYsRDIx5yWXx7DUDBK+O9OxBQI5U37iQcAfq1qdpZ3GJFiAFud5cizJeIkdyzA
pTO7sYzvcsU8xNTkIukrEErOIYtIpyBgq/ZbANCELRJmEeL4sVvRKn9k1YS2ib+B
fRtWBpRcCWp51lDO1I3Agdwwuy0sYflipjz+Ng0bkxjHKoai3631B+bE0FKn5Sym
VE72yCD2yWFRlg9DRp4kOUy8BaK46594ieXgYGaU8dJeAYPpXt0zUxKnmiX9iPXB
we6cwDw4Y4gTmB1CUlS0EoRUlA52GZi8XbLutH+y9gHNEVaT1see9u77jUTnQ0ZI
G1XX5Aw3TIJ4xpJvuRhwfU4ajnSCrdOuYoYvF9844w==
=u0dg
-----END PGP MESSAGE-----`,
    fiscalCode: myEnv.FISCAL_CODE_EXISTING,
    expireYear: '2023',
    exprireMonth: '08',
    issuerAbiCode: '07601',
    brand: 'VISA',
    holder: 'Pinco Pallino',
    type: 'CRD',
    channel: '65406',
    vatNumber: '15376371009',
}
//console.log(JSON.stringify(body))
export default () => {
    group('FA Payment Instruments API', () => {
        group('Should create an FA PI CUSTOMER', () =>
            assert(putFaPICustomerByCard(baseUrl, params, body), [statusOk()])
        )
        /* group('Should get an FA PI CUSTOMER', () =>
			assert(getFaPICustomer(baseUrl, params, body.id, body.fiscalCode), [
				statusOk(),
			])
		) */
    })
}
