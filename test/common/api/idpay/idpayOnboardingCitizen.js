import http from 'k6/http'
import { logResult } from '../../dynamicScenarios/utils'

const API_PREFIX = '/idpay'
export function getInitiative(baseUrl, params, serviceId, headers) {
    const myParams = Object.assign({}, params)
    const res = http.get(
        `${baseUrl}${API_PREFIX}/onboarding/service/${serviceId}`,
        myParams,
        headers
    )
    logResult('onboarding/getInitiative', res)
    return res
}

export function putOnboardingCitizen(baseUrl, body, params) {
    const myParams = Object.assign({}, params)
    const res = http.put(`${baseUrl}${API_PREFIX}/onboarding/`, body, myParams)
    logResult('onboarding/putOnboardingCitizen', res)
    return res
}

export function putCheckPrerequisites(baseUrl, body, params) {
    const myParams = Object.assign({}, params)
    const res = http.put(
        `${baseUrl}${API_PREFIX}/onboarding/initiative`,
        body,
        myParams
    )
    logResult('onboarding/putCheckPrerequisites', res)
    return res
}

export function getStatus(baseUrl, params, initiativeId) {
    const myParams = Object.assign({}, params)
    const res = http.get(
        `${baseUrl}${API_PREFIX}/onboarding/${initiativeId}/status`,
        myParams
    )
    logResult('onboarding/getStatus', res)
    return res
}

export function putSaveConsent(baseUrl, body, params) {
    const myParams = Object.assign({}, params)
    const res = http.put(
        `${baseUrl}${API_PREFIX}/onboarding/consent`,
        body,
        myParams
    )
    logResult('onboarding/putSaveConsent', res)
    return res
}
