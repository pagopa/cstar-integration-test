import http from 'k6/http'

const API_PREFIX = '/bpd/tc'

export function getBpdTermsAndConditionsViaBlob(baseUrl, params) {
    const res = http.get(
        `${baseUrl}/pagopastorage/bpd-terms-and-conditions/bpd-tc.html`,
        params
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function getBpdTermsAndConditionsHtml(baseUrl, params) {
    const res = http.get(`${baseUrl}${API_PREFIX}/html`, params)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function getBpdTermsAndConditionsPdf(baseUrl, params) {
    const res = http.get(`${baseUrl}${API_PREFIX}/pdf`, params)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
