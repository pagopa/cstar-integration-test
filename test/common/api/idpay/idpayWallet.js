import http from 'k6/http'
import { logResult } from '../../dynamicScenarios/utils.js'

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
    logResult('wallet/putEnrollInstrumentIssuer', res)
    return res
}

export function putEnrollIbanIssuer(baseUrl, body, headers, initiativeId) {
    const res = http.put(
        `${baseUrl}${API_PREFIX}/hb/wallet/${initiativeId}/iban`,
        body,
        { headers }
    )
    logResult('wallet/putEnrollIbanIssuer', res)
    return res
}

export function putEnrollIban(baseUrl, initiativeId, params, body) {
    const myParams = Object.assign({}, params)
    const res = http.put(
        `${baseUrl}${API_PREFIX}/wallet/${initiativeId}/iban`,
        body,
        myParams
    )
    logResult('wallet/putEnrollIban', res)
    return res
}

export function getWalletDetail(baseUrl, headers, params, initiativeId) {
    const myParams = Object.assign({}, params)
    const res = http.put(
        `${baseUrl}${API_PREFIX}/hb/wallet/${initiativeId}/instruments`,
        myParams,
        { headers }
    )
    logResult('wallet/getWalletDetail', res)
    return res
}
