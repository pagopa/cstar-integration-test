import http from 'k6/http'

const API_PREFIX = '/idpay/payment/qr-code'
const API_MIL_PREFIX = '/idpay/mil/payment/qr-code/merchant'
export function createTransaction(baseUrl, body, params) {
    const res = http.post(`${baseUrl}${API_MIL_PREFIX}`, body, params)

    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function preAuth(baseUrl, trxCode, params) {
    const res = http.put(
        `${baseUrl}${API_PREFIX}/${trxCode}/relate-user`,
        null,
        params
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function authTrx(baseUrl, trxCode, params) {
    const res = http.put(
        `${baseUrl}${API_PREFIX}/${trxCode}/authorize`,
        null,
        params
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
