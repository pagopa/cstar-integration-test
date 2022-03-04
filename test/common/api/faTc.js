import http from 'k6/http'

const API_PREFIX = '/fa/tc'

export function getFaTermsAndConditionsViaBlob(baseUrl, params) {
    const res = http.get(
        `${baseUrl}/pagopastorage/fa-terms-and-conditions/fa-tc.html`,
        params
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function getFaTermsAndConditionsHtml(baseUrl, params) {
    const res = http.get(`${baseUrl}${API_PREFIX}/html`, params)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function getFaTermsAndConditionsPdf(baseUrl, params) {
    const res = http.get(`${baseUrl}${API_PREFIX}/pdf`, params)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
