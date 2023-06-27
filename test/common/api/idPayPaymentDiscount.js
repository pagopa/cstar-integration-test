import http from 'k6/http'

const API_PREFIX = '/idpay/payment/qr-code'
export function createTransaction(baseUrl, body, headers){
    const res = http.post(
        `${baseUrl}${API_PREFIX}/merchant`,
        body,
        {headers : headers}
    )

    __Env.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}