import http from 'k6/http'

const API_PREFIX = '/idpay/payment/qr-code'
export function createTransaction(baseUrl, body, headers){
    const res = http.post(
        `${baseUrl}${API_PREFIX}/merchant`,
        body,
        {headers : headers}
    )

    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function preAuth(baseUrl, headers, trxCode) {
    const res = http.put(
        `${baseUrl}${API_PREFIX}/${trxCode}/relate-user`,
        {headers : headers}
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function authTrx(baseUrl, headers, trxCode) {
    const res = http.put(
        `${baseUrl}${API_PREFIX}/${trxCode}/authorize`,
        {headers : headers}
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}