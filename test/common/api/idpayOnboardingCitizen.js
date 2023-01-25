import http from 'k6/http'

const API_PREFIX = '/idpay'
export function getInitiative(baseUrl, params, serviceId, headers) {
    const myParams = Object.assign({}, params)
    const res = http.get(
        `${baseUrl}${API_PREFIX}/onboarding/service/${serviceId}`,
        myParams,
        headers
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function putOnboardingCitizen(baseUrl, body, params) {
    const myParams = Object.assign({}, params)
    const res = http.put(
        `${baseUrl}${API_PREFIX}/onboarding/`,
        body,
        myParams
    )  
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function putCheckPrerequisites(baseUrl, body, params) {
    const myParams = Object.assign({}, params)
    const res = http.put(
        `${baseUrl}${API_PREFIX}/onboarding/initiative`,
        body,
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function getStatus(baseUrl, params, initiativeId) {
    const myParams = Object.assign({}, params)
    const res = http.get(
        `${baseUrl}${API_PREFIX}/onboarding/${initiativeId}/status`,
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}


export function putSaveConsent(baseUrl, body, params) {
    const myParams = Object.assign({}, params)
    const res = http.put(
        `${baseUrl}${API_PREFIX}/onboarding/consent`,
        body,
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
