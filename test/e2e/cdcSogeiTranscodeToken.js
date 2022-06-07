import { group } from 'k6'
import exec from 'k6/execution'
import { sogeiHealthCheck } from '../common/api/cdcSogeiHealthCheck.js'
import { loginFullUrl } from '../common/api/bpdIoLogin.js'
import { assert, statusOk } from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, UAT, PROD } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { randomFiscalCode } from '../common/utils.js'

const REGISTERED_ENVS = [UAT, PROD]

const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let myEnv

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_io`].baseUrl
}

export function setup() {
    const authToken = loginFullUrl(
        `${services.uat_io.baseUrl}/bpd/pagopa/api/v1/login`,
        randomFiscalCode()
    )
    return {
        headers: {
            Authorization: `Bearer ${authToken}`,
            'Ocp-Apim-Subscription-Key': `${myEnv.APIM_SK};product=app-io-product`,
            'Ocp-Apim-Trace': 'true',
        },
    }
}

export default (params) => {
    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        return
    }
    group('SOGEI CdC', () => {
        group('Should GET HealthCheck', () =>
            assert(sogeiHealthCheck(baseUrl, params), [statusOk()])
        )
    })
}
