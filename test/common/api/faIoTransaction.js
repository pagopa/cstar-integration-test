import http from 'k6/http'
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js'

const API_PREFIX = '/fa/io/transaction'

export function getTransactionList(baseUrl, params, hpan) {
    const myParams = Object.assign({}, params)
    const url = new URL(`${baseUrl}${API_PREFIX}/list`)
    url.searchParams.append('hpan', hpan)
    const res = http.get(url.toString(), myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function getTransactionListInternal(baseUrl, params, hpan) {
    const myParams = Object.assign({}, params)
    const apiPrefix = '/famstransaction/fa/transaction'
    const url = new URL(`${baseUrl}${apiPrefix}/list/${hpan}`)
    // url.searchParams.append('hpan', hpan)
    const res = http.get(url.toString(), myParams)
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}

export function createTransactionInternal(baseUrl, params, body) {
    const myParams = Object.assign({}, params)
    const apiPrefix = '/famstransaction/fa/transaction'
    const res = http.post(
        `${baseUrl}${apiPrefix}/pos/invoice/request`,
        JSON.stringify(body),
        myParams
    )
    __ENV.REQ_DUMP === undefined || console.log(JSON.stringify(res, null, 2))
    return res
}
