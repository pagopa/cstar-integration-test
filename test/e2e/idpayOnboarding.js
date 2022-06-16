import { group } from 'k6'
import { putOnboardingCitizen } from '../common/api/idpayOnbardingCitizen.js'
import { loginFullUrl } from '../common/api/bpdIoLogin.js'
import {
    assert,
    bodyJsonReduceArray,
    statusOk,
    statusBadFormat,
    bodyJsonSelectorValue,
    idempotence,
} from '../common/assertions.js'
import { isEnvValid, isTestEnabledOnEnv, DEV } from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import { randomFiscalCode } from '../common/utils.js'

const REGISTERED_ENVS = [DEV]

const services = JSON.parse(open('../../services/environments.json'))
let baseUrl
let myEnv

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_io`].baseUrl
}

function auth(fiscalCode) {
    const authToken = loginFullUrl(
        `${baseUrl}/bpd/pagopa/api/v1/login`,
        fiscalCode
    )
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
    group('Should ondoard Citizen', () => {
        group('When the inititive exists', () => {
            const body = {
                initiativeId : "123"
            }
            assert(putOnboardingCitizen(baseUrl, body, auth(randomFiscalCode()) ), [
                statusOk()
            ])
        })
    })

}
