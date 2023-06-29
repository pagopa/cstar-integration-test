import { group } from 'k6'
import {
    assert,
    statusOk,
    statusUnauthorized
} from '../common/assertions.js'
import {
    isEnvValid,
    isTestEnabledOnEnv,
    DEV,
    UAT
} from '../common/envs.js'
import dotenv from 'k6/x/dotenv'
import {
    loginWithApiKey,
    getUser,
    getMockedIoToken
} from '../common/api/bpdIoLogin.js'

const REGISTERED_ENVS = [DEV, UAT]

const services = JSON.parse(open('../../services/environments.json'))
export let options = {}
let baseUrl
let myEnv
let fiscalCode = 'XXXYYY99A00Z000X'

if (isEnvValid(__ENV.TARGET_ENV)) {
    myEnv = dotenv.parse(open(`../../.env.${__ENV.TARGET_ENV}.local`))
    baseUrl = services[`${__ENV.TARGET_ENV}_io`].baseUrl
}

export default () => {
    if (
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, REGISTERED_ENVS)
    ) {
        return
    }
    group('mock io login', () => {
        group('getToken without api key', () =>
            assert(loginWithApiKey(baseUrl, '', fiscalCode), [statusUnauthorized()])
        )
        group('getToken', () =>
            assert(loginWithApiKey(baseUrl, myEnv.APIM_MOCK_IO_SK, fiscalCode), [statusOk()])
        )
        group('getUser without api key', () => {
            const token = getMockedIoToken(baseUrl, myEnv.APIM_MOCK_IO_SK, fiscalCode)
            assert(getUser(baseUrl, '', token), [statusUnauthorized()])
        })
        group('getUser', () => {
            const token = getMockedIoToken(baseUrl, myEnv.APIM_MOCK_IO_SK, fiscalCode)
            assert(getUser(baseUrl, myEnv.APIM_MOCK_IO_SK, token), [statusOk()])
        })
    })
}
