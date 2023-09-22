import http from 'k6/http'
import { logResult } from '../../dynamicScenarios/utils.js'
import { buildIOAuthorizationHeader } from '../../idpay/envVars.js'
import { DEV, UAT, getBaseUrl } from '../../envs.js'
import { buildDefaultParams } from '../../dynamicScenarios/envVars.js'

export const ONBOARDING_API_NAMES = {
    getInitiative: 'onboarding/getInitiative',
    putOnboardingCitizen: 'onboarding/putOnboardingCitizen',
    putCheckPrerequisites: 'onboarding/putCheckPrerequisites',
    getStatus: 'onboarding/getStatus',
    putSaveConsent: 'onboarding/putSaveConsent',
    checkInitiativeBudget: 'onboarding/checkInitiativeBudget',
}

// Environments allowed to be tested
const REGISTERED_ENVS = [DEV, UAT]

const innerBaseUrl = `${getBaseUrl(
    REGISTERED_ENVS,
    'internal'
)}/idpayonboardingworkflow`
const admissibilityInnerBaseUrl = `${getBaseUrl(
    REGISTERED_ENVS,
    'internal'
)}/idpayadmissibility`
const apimBaseUrl = getBaseUrl(REGISTERED_ENVS, 'io') // api-io services baseUrl

const API_PREFIX = '/idpay/onboarding'

export function getInitiative(useInnerAccess, token, serviceId) {
    const apiName = ONBOARDING_API_NAMES.getInitiative

    let url
    const myParams = buildDefaultParams(apiName)

    if (useInnerAccess) {
        throw new Error('getInitiative inner invoke not implemented!')
    } else {
        url = `${apimBaseUrl}${API_PREFIX}/service/${serviceId}`
        myParams.headers = buildIOAuthorizationHeader(token)
    }

    const res = http.get(url, myParams)
    logResult(apiName, res)
    return res
}

export function putOnboardingCitizen(useInnerAccess, token, initiativeId) {
    const apiName = ONBOARDING_API_NAMES.putOnboardingCitizen

    let url
    const myParams = buildDefaultParams(apiName)
    const body = { initiativeId }

    if (useInnerAccess) {
        url = `${innerBaseUrl}${API_PREFIX}/${token}`
    } else {
        url = `${apimBaseUrl}${API_PREFIX}/`
        myParams.headers = buildIOAuthorizationHeader(token)
    }

    const res = http.put(url, JSON.stringify(body), myParams)
    logResult(apiName, res)
    return res
}

export function putCheckPrerequisites(useInnerAccess, token, initiativeId) {
    const apiName = ONBOARDING_API_NAMES.putCheckPrerequisites

    let url
    const myParams = buildDefaultParams(apiName)
    const body = { initiativeId }

    if (useInnerAccess) {
        url = `${innerBaseUrl}${API_PREFIX}/initiative/${token}`
        body.channel = 'APP_IO'
    } else {
        url = `${apimBaseUrl}${API_PREFIX}/initiative`
        myParams.headers = buildIOAuthorizationHeader(token)
    }

    const res = http.put(url, JSON.stringify(body), myParams)
    logResult(apiName, res)
    return res
}

export function getStatus(useInnerAccess, token, initiativeId) {
    const apiName = ONBOARDING_API_NAMES.getStatus

    let url
    const myParams = buildDefaultParams(apiName)

    if (useInnerAccess) {
        url = `${innerBaseUrl}${API_PREFIX}/${initiativeId}/${token}/status`
    } else {
        url = `${apimBaseUrl}${API_PREFIX}/${initiativeId}/status`
        myParams.headers = buildIOAuthorizationHeader(token)
    }

    const res = http.get(url, myParams)
    logResult(apiName, res)
    return res
}

export function putSaveConsent(useInnerAccess, token, initiativeId, selfDeclaration = []) {
    const apiName = ONBOARDING_API_NAMES.putSaveConsent

    let url
    const myParams = buildDefaultParams(apiName)
    const body = {
        initiativeId,
        pdndAccept: true,
        selfDeclarationList: selfDeclaration,
    }
    if (useInnerAccess) {
        url = `${innerBaseUrl}${API_PREFIX}/consent/${token}`
    } else {
        url = `${apimBaseUrl}${API_PREFIX}/consent`
        myParams.headers = buildIOAuthorizationHeader(token)
    }

    const res = http.put(url, JSON.stringify(body), myParams)
    logResult(apiName, res)
    return res
}

export function checkInitiativeBudget(useInnerAccess, initiativeId) {
    const apiName = ONBOARDING_API_NAMES.checkInitiativeBudget

    let url
    const myParams = buildDefaultParams(apiName)

    if (useInnerAccess) {
        url = `${admissibilityInnerBaseUrl}/idpay/admissibility/initiative/${initiativeId}`
    } else {
        throw new Error('Initiative budget API not exposed')
    }

    const res = http.get(url, myParams)
    logResult(apiName, res)
    return res
}
