import http from 'k6/http'

const API_PREFIX = '/fa/tc'

export function GetFaTermsAndConditionsViaBlob(baseUrl, params) {
    return http.get(
        `${baseUrl}/pagopastorage/fa-terms-and-conditions/fa-tc.html`,
        params
    )
}

export function GetFaTermsAndConditionsHtml(baseUrl, params) {
    return http.get(`${baseUrl}${API_PREFIX}/html`, params)
}

export function GetFaTermsAndConditionsPdf(baseUrl, params) {
    return http.get(`${baseUrl}${API_PREFIX}/pdf`, params)
}
