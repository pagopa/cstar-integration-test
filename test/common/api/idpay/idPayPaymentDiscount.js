import http from 'k6/http'
import { logResult } from '../../dynamicScenarios/utils.js'

const API_PREFIX = '/idpay/payment/qr-code'
const API_MIL_PREFIX = '/idpay/mil/payment/qr-code/merchant'
export function createTransaction(baseUrl, body, params) {
    const apiName = 'payment/createTransaction'
    const myParams = Object.assign({}, params, { tags: { apiName } })
    const res = http.post(`${baseUrl}${API_MIL_PREFIX}`, body, myParams)

    logResult(apiName, res)
    return res
}

export function preAuth(baseUrl, trxCode, params) {
    const apiName = 'payment/preAuth'
    const myParams = Object.assign({}, params, { tags: { apiName } })
    const res = http.put(
        `${baseUrl}${API_PREFIX}/${trxCode}/relate-user`,
        null,
        myParams
    )

    logResult(apiName, res)
    return res
}

export function authTrx(baseUrl, trxCode, params) {
    const apiName = 'payment/authTrx'
    const myParams = Object.assign({}, params, { tags: { apiName } })
    const res = http.put(
        `${baseUrl}${API_PREFIX}/${trxCode}/authorize`,
        null,
        myParams
    )

    logResult(apiName, res)
    return res
}
