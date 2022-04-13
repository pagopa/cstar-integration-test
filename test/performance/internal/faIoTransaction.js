import { group } from 'k6'
import exec from 'k6/execution'
import {
    getTransactionListInternal,
    createTransactionInternal,
} from '../../common/api/faIoTransaction.js'
import { assert, statusOk } from '../../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, DEV, UAT } from '../../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { randomString } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js'

const REGISTERED_ENVS = [DEV, UAT]

const services = JSON.parse(open('../../../services/environments.json'))

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

let baseUrl
let myEnv

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_issuer_internal`].baseUrl
}

// In performance tests we shall use abort() to prevent the execution
// of the default function, otherwise the VUs will be spawned
if (!isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)) {
    console.log('Test not enabled for target env')
    exec.test.abort()
}

export function setup() {
    return {
        headers: {
            'Content-Type': 'application/json',
        },
    }
}

export default (params) => {
    group('FA IO Transaction API', () => {
        const body = {
            amount: 43,
            binCard: '11223344',
            authCode: randomString(11),
            vatNumber: '04533641009',
            posType: 'ASSERVED_POS',
            terminalId: '11111111',
            trxDate: '1983-05-02T00:00:00.000Z',
            contractId: '3',
        }

        group('Should get a Transaction', () =>
            assert(
                getTransactionListInternal(baseUrl, params, body.vatNumber),
                [statusOk()]
            )
        )

        group('Should create a Transaction', () =>
            assert(createTransactionInternal(baseUrl, params, body), [
                statusOk(),
            ])
        )
    })
}
