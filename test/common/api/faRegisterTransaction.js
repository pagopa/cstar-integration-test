import http from 'k6/http'

const API_PREFIX = '/fa/transaction'

export function getPosTransaction(baseUrl, params, id) {
    const myParams = Object.assign({}, params)
    const res = http.get(
        `${baseUrl}${API_PREFIX}/pos/invoice/request/${id}`,
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function createPosTransaction(baseUrl, params, body) {
    const myParams = Object.assign({}, params)
    const res = http.post(
        `${baseUrl}${API_PREFIX}/pos/invoice/request`,
        JSON.stringify(body),
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
