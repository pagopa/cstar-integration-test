import { group } from 'k6'
import exec from 'k6/execution'
import {
    getPosTransaction,
    createPosTransaction,
} from '../common/api/faRegisterTransaction.js'
import { assert, statusOk } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, DEV, UAT } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { randomString } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js'

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

function extractTransactionId(response) {
    if (response.status === 200 && response.body) {
        const respBody = JSON.parse(response.body)
        return respBody.id
    }
    return ''
}

export function createTransactionBody() {
    return {
        amount: 43,
        binCard: '11223344',
        authCode: randomString(11),
        vatNumber: '04533641009',
        posType: 'ASSERVED_POS',
        terminalId: '11111111',
        trxDate: '1983-05-02T00:00:00.000Z',
        contractId: '3',
    }
}

export function createTransactionTest(baseUrl, params, body) {
    const res = createPosTransaction(baseUrl, params, body)
    assert(res, [statusOk()])
    return extractTransactionId(res)
}

export function getTransactionTest(baseUrl, params, transactionId) {
    assert(getPosTransaction(baseUrl, params, transactionId), [statusOk()])
}

export default () => {
    group('FA REGISTER Transaction API', () => {
        let transactionId = ''
        const body = createTransactionBody()
        group('Should create a Transaction', () => {
            transactionId = createTransactionTest(baseUrl, params, body)
        })
        group('Should get a Transaction', () =>
            getTransactionTest(baseUrl, params, transactionId)
        )
    })
}
