import http from 'k6/http'
import { logResult } from '../../dynamicScenarios/utils.js'
import { buildDefaultParams } from '../../dynamicScenarios/envVars.js'
import { DEV, UAT, getBaseUrl } from '../../envs.js'
import { buildIOAuthorizationHeader } from '../../idpay/envVars.js'

export const WALLET_API_NAMES = {
    putEnrollInstrumentIssuer: 'wallet/putEnrollInstrumentIssuer',
    putEnrollIbanIssuer: 'wallet/putEnrollIbanIssuer',
    putEnrollIban: 'wallet/putEnrollIban',
    getWalletDetail: 'wallet/getWalletDetail',
}

// Environments allowed to be tested
const REGISTERED_ENVS = [DEV, UAT]

const innerBaseUrl = `${getBaseUrl(REGISTERED_ENVS, 'internal')}/idpaywallet`
const apimBaseUrl = getBaseUrl(REGISTERED_ENVS, 'io') // api-io services baseUrl

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

export function getWalletDetail(useInnerAccess, token, initiativeId) {
    const apiName = WALLET_API_NAMES.getWalletDetail

    let url
    const myParams = buildDefaultParams(apiName)

    if (useInnerAccess) {
        url = `${innerBaseUrl}${API_PREFIX}/wallet/${initiativeId}/${token}`
    } else {
        url = `${apimBaseUrl}${API_PREFIX}/wallet/${initiativeId}`
        myParams.headers = buildIOAuthorizationHeader(token)
    }

    const res = http.get(url, myParams)
    logResult(apiName, res)
    return res
}
