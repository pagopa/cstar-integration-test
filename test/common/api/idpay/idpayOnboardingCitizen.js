import http from 'k6/http'
import { logResult } from '../../dynamicScenarios/utils.js'

const API_PREFIX = '/idpay'
export function getInitiative(baseUrl, params, serviceId, headers) {
    const apiName = 'onboarding/getInitiative'

    const myParams = Object.assign({}, params)
    const res = http.get(
        `${baseUrl}${API_PREFIX}/onboarding/service/${serviceId}`,
        myParams,
        {
            headers,
            tags: { apiName },
        }
    )
    logResult(apiName, res)
    return res
}

export function putOnboardingCitizen(baseUrl, body, params) {
    const apiName = 'onboarding/putOnboardingCitizen'
    const myParams = Object.assign({}, params, { tags: { apiName } })
    const res = http.put(`${baseUrl}${API_PREFIX}/onboarding/`, body, myParams)
    logResult(apiName, res)
    return res
}

export function putCheckPrerequisites(baseUrl, body, params) {
    const apiName = 'onboarding/putCheckPrerequisites'
    const myParams = Object.assign({}, params, { tags: { apiName } })
    const res = http.put(
        `${baseUrl}${API_PREFIX}/onboarding/initiative`,
        body,
        myParams
    )
    logResult(apiName, res)
    return res
}

export function getStatus(baseUrl, params, initiativeId) {
    const apiName = 'onboarding/getStatus'
    const myParams = Object.assign({}, params, { tags: { apiName } })
    const res = http.get(
        `${baseUrl}${API_PREFIX}/onboarding/${initiativeId}/status`,
        myParams
    )
    logResult(apiName, res)
    return res
}

export function putSaveConsent(baseUrl, body, params) {
    const apiName = 'onboarding/putSaveConsent'
    const myParams = Object.assign({}, params, { tags: { apiName } })
    const res = http.put(
        `${baseUrl}${API_PREFIX}/onboarding/consent`,
        body,
        myParams
    )
    logResult(apiName, res)
    return res
}
