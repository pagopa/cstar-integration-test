import http from 'k6/http'

const API_PREFIX = '/idpay'

export function putEnrollInstrumentIssuer(baseUrl, body, headers, initiativeId) {
    const res = http.put(
        `${baseUrl}${API_PREFIX}/hb/wallet/${initiativeId}/instruments`,
        body,
        headers
    )  
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}