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
        !isEnvValid(__ENV.TARGET_ENV) ||
        !isTestEnabledOnEnv(__ENV.TARGET_ENV, operationAvailableEnvs)
    ) {
        abort('Environment selected not allowed for the test')
        return null
    } else {
        return services[`${__ENV.TARGET_ENV}_${system}`].baseUrl
    }
}
