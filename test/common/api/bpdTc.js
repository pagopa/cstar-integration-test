import http from 'k6/http'

const API_PREFIX = '/bpd/tc'

export function GetBpdTermsAndConditionsViaBlob(baseUrl, params) {
    return http.get(
        `${baseUrl}/pagopastorage/bpd-terms-and-conditions/bpd-tc.html`,
        params
    )
}

export function GetBpdTermsAndConditionsHtml(baseUrl, params) {
    return http.get(`${baseUrl}/bpd/tc/html`, params)
}

export function GetBpdTermsAndConditionsPdf(baseUrl, params) {
    return http.get(`${baseUrl}/bpd/tc/pdf`, params)
}
