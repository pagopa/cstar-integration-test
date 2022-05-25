import http from 'k6/http'

const API_PREFIX = '/fa/mock'

export function rtdSendTransaction(baseUrl, params, body) {
    params.headers.product = 'issuer-api-product'
    const myParams = Object.assign({}, params)
    const res = http.post(
        `${baseUrl}${API_PREFIX}/transaction/rtd/send`,
        JSON.stringify(body),
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
