import http from 'k6/http'
import { logResult } from '../../dynamicScenarios/utils.js'

export const WALLET_API_NAMES = {
    putEnrollInstrumentIssuer: 'wallet/putEnrollInstrumentIssuer',
    putEnrollIbanIssuer: 'wallet/putEnrollIbanIssuer',
    putEnrollIban: 'wallet/putEnrollIban',
    getWalletDetail: 'wallet/getWalletDetail'
}

const API_PREFIX = '/idpay'

export function putEnrollInstrumentIssuer(
    baseUrl,
    body,
    headers,
    initiativeId
) {
    const apiName = WALLET_API_NAMES.putEnrollInstrumentIssuer
    const res = http.put(
        `${baseUrl}${API_PREFIX}/hb/wallet/${initiativeId}/instruments`,
        body,
        { headers, tags: { apiName } }
    )
    logResult(apiName, res)
    return res
}

export function putEnrollIbanIssuer(baseUrl, body, headers, initiativeId) {
    const apiName = WALLET_API_NAMES.putEnrollIbanIssuer
    const res = http.put(
        `${baseUrl}${API_PREFIX}/hb/wallet/${initiativeId}/iban`,
        body,
        { headers, tags: { apiName } }
    )
    logResult(apiName, res)
    return res
}

export function putEnrollIban(baseUrl, initiativeId, params, body) {
    const apiName = WALLET_API_NAMES.putEnrollIban
    const myParams = Object.assign({}, params, { tags: { apiName } })
    const res = http.put(
        `${baseUrl}${API_PREFIX}/wallet/${initiativeId}/iban`,
        body,
        myParams
    )
    logResult(apiName, res)
    return res
}

export function getWalletDetail(baseUrl, initiativeId, params) {
    const apiName = WALLET_API_NAMES.getWalletDetail
    const myParams = Object.assign({}, params, { tags: { apiName } })
    const res = http.get(
        `${baseUrl}${API_PREFIX}/wallet/${initiativeId}`,
        myParams
    )
    logResult(apiName, res)
    return res
}
