import { group } from 'k6'
import { performanceHappyCase } from '../common/api/cdcIoRequest.js'
import { loginFullUrl } from '../common/api/bpdIoLogin.js'
import { assert, statusOk } from '../common/assertions.js'
import {isEnvValid, isTestEnabledOnEnv, PROD, UAT} from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { randomFiscalCode } from '../common/utils.js'
import { bodyJsonReduceArray } from '../common/assertions.js'
const REGISTERED_ENVS = [UAT, PROD]

export let options = {
    scenarios: {
        ramp: {
            executor: 'ramping-arrival-rate',
            startRate: 50,
            timeUnit: '1s',
            preAllocatedVUs: 50,
            maxVUs: 1000,
            stages: [
                { duration: '5s', target: 100 },
                { duration: '5s', target: 100 },
            ],
        },
    },

    summaryTrendStats: [
        'med',
        'avg',
        'min',
        'max',
        'count',
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

// export let options = {
//     scenarios: {
//         constant_request_rate: {
//             executor: 'constant-arrival-rate',
//             rate: 1000,
//             timeUnit: '1s',
//             duration: '30s',
//             preAllocatedVUs: 10,
//             maxVUs: 100,
//         },
//     },
//     summaryTrendStats: [
//         'med',
//         'avg',
//         'min',
//         'max',
//         'p(10)',
//         'p(20)',
//         'p(30)',
//         'p(40)',
//         'p(50)',
//         'p(60)',
//         'p(70)',
//         'p(80)',
//         'p(90)',
//     ],
// }

const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let myEnv

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_io`].baseUrl
}

export function auth(fiscalCode) {
    let authToken
    if (__ENV.TARGET_ENV === "prod") {
        authToken = myEnv.BPD_TOKEN
    } else {
        const service = (__ENV.TARGET_ENV === "uat") ? services.uat_io : services.dev_io
        authToken = loginFullUrl(
            `${service.baseUrl}/bpd/pagopa/api/v1/login`,
            randomFiscalCode()
        )
    }
    return {
        headers: {
            Authorization: `Bearer ${authToken}`,
            'Ocp-Apim-Subscription-Key': `${myEnv.APIM_SK};product=app-io-product`,
            'Ocp-Apim-Trace': 'true',
        },
    }
}

export default () => {
    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        return
    }
    group('Should request CdC', () => {
        group('When the post contains all years returned by get', () => {
            const esitoOkReducer = (prv, cur) =>
                prv && cur.esitoRichiesta === 'INIZIATIVA_TERMINATA'
            assert(performanceHappyCase(baseUrl, auth(randomFiscalCode())), [
                statusOk(),
                bodyJsonReduceArray(
                    'listaEsitoRichiestaPerAnno',
                    esitoOkReducer,
                    true,
                    true
                ),
            ])
        })
    })
}
