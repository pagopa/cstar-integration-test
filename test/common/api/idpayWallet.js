import http from 'k6/http'

const API_PREFIX = '/idpay'

export function putEnrollInstrumentIssuer(baseUrl, body, params, initiativeId) {
    const myParams = Object.assign({}, params)
    const res = http.put(
        `${baseUrl}${API_PREFIX}hb/wallet/${initiativeId}/instruments`,
        body,
        myParams
    )  
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}