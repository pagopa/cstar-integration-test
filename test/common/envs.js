import { CONFIG } from './dynamicScenarios/envVars.js'
import { abort } from './utils.js'

export const DEV = 'dev'
export const UAT = 'uat'
export const PROD = 'prod'

export const VALID_ENVS = [DEV, UAT, PROD]

export const SERVICES = JSON.parse(open('../../services/environments.json'))

export function isEnvValid(env) {
    return VALID_ENVS.includes(env)
}

export function isTestEnabledOnEnv(env, registeredEnvs) {
    return registeredEnvs.includes(env)
}

export function getBaseUrl(operationAvailableEnvs, system) {
    if (
        !isEnvValid(CONFIG.TARGET_ENV) ||
        !isTestEnabledOnEnv(CONFIG.TARGET_ENV, operationAvailableEnvs)
    ) {
        abort('Environment selected not allowed for the test')
        return null
    } else {
        return SERVICES[`${CONFIG.TARGET_ENV}_${system}`].baseUrl
    }
}
