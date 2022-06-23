import { group } from 'k6'
import exec from 'k6/execution'
import { getTransactionList } from '../common/api/faIoTransaction.js'
import { assert, statusOk } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, DEV, UAT } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { randomFiscalCode } from '../common/utils.js'
import { login } from '../common/api/bpdIoLogin.js'

const REGISTERED_ENVS = [DEV, UAT]

const services = JSON.parse(open('../../services/environments.json'))

export let options = JSON.parse(open('../../options/constant_load.json'))

let baseUrl
let myEnv

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_io`].baseUrl
}

// In performance tests we shall use abort() to prevent the execution
// of the default function, otherwise the VUs will be spawned
if (!isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)) {
    console.log('Test not enabled for target env')
    exec.test.abort()
}

export function setup() {
    const authToken = login(baseUrl, myEnv.FISCAL_CODE_EXISTING)
    return {
        headers: {
            Authorization: `Bearer ${authToken}`,
            'Ocp-Apim-Subscription-Key': `${
                myEnv.APIM_IO_SK || myEnv.APIM_SK
            };product=app-io-product`,
            'Ocp-Apim-Trace': 'true',
            'Content-Type': 'application/json',
        },
    }
}

export default (params) => {
    group('FA IO Transaction API', () => {
        const vat = randomFiscalCode()

        group('Should get Transaction List', () =>
            assert(getTransactionList(baseUrl, params, vat), [statusOk()])
        )
    })
}
