import http from 'k6/http'
import { logResult } from '../../dynamicScenarios/utils.js'
import { DEV, UAT, getBaseUrl } from '../../envs.js'
import { buildDefaultParams } from '../../dynamicScenarios/envVars.js'
import {
    IDPAY_CONFIG,
    buildIOAuthorizationHeader,
} from '../../idpay/envVars.js'

export const PAYMENT_API_NAMES = {
    createTransaction: 'payment/createTransaction',
    preAuth: 'payment/preAuth',
    authTrx: 'payment/authTrx',
}

// Environments allowed to be tested
const REGISTERED_ENVS = [DEV, UAT]

const innerBaseUrl = `${getBaseUrl(REGISTERED_ENVS, 'internal')}/idpaypayment`
const apimBaseUrl = getBaseUrl(REGISTERED_ENVS, 'io') // api-io services baseUrl

const API_PREFIX = '/idpay/payment'
const API_QRCODE_PREFIX = '/idpay/payment/qr-code'
const API_MIL_PREFIX = '/idpay/mil/payment'

function configureMerchantRequest(useInnerAccess, merchantToken, params) {
    let baseUrl
    let tokenHeader
    if (useInnerAccess) {
        baseUrl = `${innerBaseUrl}${API_PREFIX}`
        tokenHeader = 'x-merchant-id'
        params.headers['x-apim-request-id'] = Math.random()
    } else {
        baseUrl = `${apimBaseUrl}${API_MIL_PREFIX}`
        tokenHeader = 'x-merchant-fiscalcode'
        params.headers['Ocp-Apim-Subscription-Key'] =
            IDPAY_CONFIG.AUTH_KEYS.APIM_MIL_SK
    }
    params.headers[tokenHeader] = merchantToken
    params.headers['x-acquirer-id'] = IDPAY_CONFIG.CONTEXT_DATA.acquirerId

    return baseUrl
}

function configureCitizenRequest(useInnerAccess, citizenToken, params) {
    let baseUrl
    if (useInnerAccess) {
        baseUrl = innerBaseUrl
        params.headers['x-user-id'] = citizenToken
    } else {
        baseUrl = apimBaseUrl
        params.headers = buildIOAuthorizationHeader(citizenToken)
    }

    return baseUrl
}

export function createTransaction(useInnerAccess, merchantToken, trx) {
    const apiName = PAYMENT_API_NAMES.createTransaction

    const myParams = buildDefaultParams(apiName)
    const url = configureMerchantRequest(
        useInnerAccess,
        merchantToken,
        myParams
    )
    const body = trx

    const res = http.post(url, JSON.stringify(body), myParams)
    logResult(apiName, res)
    return res
}

export function preAuth(useInnerAccess, citizenToken, trxCode) {
    const apiName = PAYMENT_API_NAMES.preAuth

    const myParams = buildDefaultParams(apiName)
    const baseUrl = configureCitizenRequest(
        useInnerAccess,
        citizenToken,
        myParams
    )

    const res = http.put(
        `${baseUrl}${API_QRCODE_PREFIX}/${trxCode}/relate-user`,
        null,
        myParams
    )
    logResult(apiName, res)
    return res
}

export function authTrx(useInnerAccess, citizenToken, trxCode) {
    const apiName = PAYMENT_API_NAMES.authTrx

    const myParams = buildDefaultParams(apiName)
    const baseUrl = configureCitizenRequest(
        useInnerAccess,
        citizenToken,
        myParams
    )

    const res = http.put(
        `${baseUrl}${API_QRCODE_PREFIX}/${trxCode}/authorize`,
        null,
        myParams
    )
    logResult(apiName, res)
    return res
}
