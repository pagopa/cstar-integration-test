export const DEV = 'dev'
export const UAT = 'uat'
export const PROD = 'prod'

export const VALID_ENVS = [DEV, UAT, PROD]

export function isEnvValid(env) {
	return VALID_ENVS.includes(env)
}

export function isTestEnabledOnEnv(env, registeredEnvs) {
	return registeredEnvs.includes(env)
}
