import http from 'k6/http'
import { logResult } from '../../dynamicScenarios/utils.js'

const API_PREFIX = '/idpay'

export function putEnrollInstrumentIssuer(
    baseUrl,
    body,
    headers,
    initiativeId
) {
    const apiName = 'wallet/putEnrollInstrumentIssuer'
    const res = http.put(
        `${baseUrl}${API_PREFIX}/hb/wallet/${initiativeId}/instruments`,
        body,
        { headers, tags: { apiName } }
    )
    logResult(apiName, res)
    return res
}

export function putEnrollIbanIssuer(baseUrl, body, headers, initiativeId) {
    const apiName = 'wallet/putEnrollIbanIssuer'
    const res = http.put(
        `${baseUrl}${API_PREFIX}/hb/wallet/${initiativeId}/iban`,
        body,
        { headers, tags: { apiName } }
    )
    logResult(apiName, res)
    return res
}

export function putEnrollIban(baseUrl, initiativeId, params, body) {
    const apiName = 'wallet/putEnrollIban'
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
    const apiName = 'wallet/getWalletDetail'
    const myParams = Object.assign(params, { tags: { apiName } })
    const res = http.get(
        `${baseUrl}${API_PREFIX}/wallet/${initiativeId}`,
        null,
        myParams
    )
    logResult(apiName, res)
    return res
}
