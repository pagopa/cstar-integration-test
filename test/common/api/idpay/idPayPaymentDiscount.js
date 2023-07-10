import http from 'k6/http'
import { logResult } from '../../dynamicScenarios/utils.js'

export const PAYMENT_API_NAMES = {
    createTransaction: 'payment/createTransaction',
    preAuth: 'payment/preAuth',
    authTrx: 'payment/authTrx',
}

const API_PREFIX = '/idpay/payment/qr-code'
const API_MIL_PREFIX = '/idpay/mil/payment/qr-code/merchant'
export function createTransaction(baseUrl, body, params) {
    const apiName = PAYMENT_API_NAMES.createTransaction
    const myParams = Object.assign({}, params, { tags: { apiName } })
    const res = http.post(`${baseUrl}${API_MIL_PREFIX}`, body, myParams)

    logResult(apiName, res)
    return res
}

export function preAuth(baseUrl, trxCode, params) {
    const apiName = PAYMENT_API_NAMES.preAuth
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
    const apiName = PAYMENT_API_NAMES.authTrx
    const myParams = Object.assign({}, params, { tags: { apiName } })
    const res = http.put(
        `${baseUrl}${API_PREFIX}/${trxCode}/authorize`,
        null,
        myParams
    )

    logResult(apiName, res)
    return res
}
