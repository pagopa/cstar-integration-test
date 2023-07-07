import http from 'k6/http'

const API_PREFIX = '/idpay'

export function putEnrollInstrumentIssuer(
    baseUrl,
    body,
    headers,
    initiativeId
) {
    const res = http.put(
        `${baseUrl}${API_PREFIX}/hb/wallet/${initiativeId}/instruments`,
        body,
        { headers }
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function putEnrollIbanIssuer(baseUrl, body, headers, initiativeId) {
    const res = http.put(
        `${baseUrl}${API_PREFIX}/hb/wallet/${initiativeId}/iban`,
        body,
        { headers }
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function putEnrollIban(baseUrl, initiativeId, params, body) {
    const myParams = Object.assign({}, params)
    const res = http.put(
        `${baseUrl}${API_PREFIX}/wallet/${initiativeId}/iban`,
        body,
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function getWalletDetail(baseUrl, headers, params, initiativeId) {
    const myParams = Object.assign({}, params)
    const res = http.put(
        `${baseUrl}${API_PREFIX}/hb/wallet/${initiativeId}/instruments`,
        myParams,
        { headers }
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
