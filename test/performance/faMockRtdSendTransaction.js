import { group } from 'k6'
import exec from 'k6/execution'
import { rtdSendTransaction } from '../common/api/faMock.js'
import { assert, statusOk } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, DEV, UAT } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'

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

export default () => {
    group('FA Mock Transaction API', () => {
        const body = {
            acquirerCode: '4964835',
            acquirerId: '650684654635',
            amount: 43,
            amountCurrency: '978',
            bin: '870965',
            circuitType: '02',
            correlationId: '6840974651304',
            hpan: 'df0765566e279292d7079ed995c46e8d12267a2a42baa50b439de4fb2f2e32a0',
            idTrxAcquirer: '6849018651351',
            idTrxIssuer: '68409489648604165',
            mcc: '7011',
            merchantId: '1',
            operationType: '00',
            terminalId: '40654165',
            trxDate: '1983-05-02T00:00:00.000Z',
        }
        group('Should send a RTD Transaction', () => {
            const res = rtdSendTransaction(baseUrl, params, body)
            assert(res, [statusOk()])
        })
    })
}
