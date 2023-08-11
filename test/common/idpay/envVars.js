import { getMockedIoToken, loginFullUrl } from '../api/bpdIoLogin.js'
import { CONFIG, defaultHeaders } from '../dynamicScenarios/envVars.js'
import { getScenarioTestEntity } from '../dynamicScenarios/utils.js'
import { DEV, PROD, UAT, getBaseUrl } from '../envs.js'
import { coalesce } from '../utils.js'

export const IDPAY_CONFIG = {
    CONTEXT_DATA: {
        initiativeId: coalesce(__ENV.INITIATIVE_ID, 'Auto'),
        merchantFiscalCode: __ENV.MERCHANT_FISCALCODE,
        acquirerId: __ENV.ACQUIRER_ID,
    },

    ENABLE_TRACE: coalesce(__ENV.ENABLE_TRACE, 'false'),

    AUTH_KEYS: {
        APIM_IO_SK: __ENV.APIM_IO_SK,
        APIM_MIL_SK: __ENV.APIM_MIL_SK,
        APIM_ACQUIRER_SK: __ENV.APIM_ACQUIRER_SK,
        APIM_ISSUER_SK: __ENV.APIM_ISSUER_SK,
        APIM_RTD_SK: __ENV.APIM_RTD_SK,
        APIM_RTD_MOCK_API_SK: __ENV.APIM_RTD_MOCK_API_SK,
        PDV_API_KEY: __ENV.PDV_API_KEY,
    },
}

export const idpayDefaultHeaders = Object.assign(
    {
        'Ocp-Apim-Subscription-Key': IDPAY_CONFIG.AUTH_KEYS.APIM_IO_SK,
        'Ocp-Apim-Trace': IDPAY_CONFIG.ENABLE_TRACE,
    },
    defaultHeaders
)

const ioBaseUrl = getBaseUrl([DEV, UAT, PROD], 'io')
export function getIOToken(fiscalCode) {
    return getMockedIoToken(
        ioBaseUrl,
        IDPAY_CONFIG.AUTH_KEYS.APIM_RTD_MOCK_API_SK,
        fiscalCode
    )
}

export function retrieveAndBuildIOAuthorizationHeader(fiscalCode) {
    const authToken = getIOToken(fiscalCode)

    return buildIOAuthorizationHeader(authToken)
}

export function buildIOAuthorizationHeader(tokenIO) {
    return Object.assign(
        {
            Authorization: `Bearer ${tokenIO}`,
        },
        idpayDefaultHeaders
    )
}

export function getIdPayScenarioUserToken(usersList) {
    // selecting current scenario/iteration test entity
    const user = getScenarioTestEntity(usersList)

    if (CONFIG.USE_INTERNAL_ACCESS_ENV) {
        return user.PDV_ID
    } else {
        return getIOToken(user.FC)
    }
}

export function getIdPayScenarioMerchantToken(merchantsList) {
    // selecting current scenario/iteration test entity
    const merchant = getScenarioTestEntity(merchantsList)

    if (CONFIG.USE_INTERNAL_ACCESS_ENV) {
        return merchant.ID
    } else {
        return merchant.CF
    }
}
