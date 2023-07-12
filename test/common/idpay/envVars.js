import { loginFullUrl } from '../api/bpdIoLogin.js'
import { defaultHeaders } from '../dynamicScenarios/envVars.js'
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
        APIM_SK: __ENV.APIM_SK,
        APIM_MIL_SK: __ENV.APIM_MIL_SK,
        APIM_ACQUIRER_SK: __ENV.APIM_ACQUIRER_SK,
        APIM_ISSUER_SK: __ENV.APIM_ISSUER_SK,
        APIM_RTD_SK: __ENV.APIM_RTD_SK,
        PDV_API_KEY: __ENV.PDV_API_KEY,
        APIM_LOGIN_KEY: __ENV.APIM_LOGIN_KEY,
    },
}

export const idpayDefaultHeaders = Object.assign(
    {
        'Ocp-Apim-Subscription-Key': IDPAY_CONFIG.AUTH_KEYS.APIM_SK,
        'Ocp-Apim-Trace': IDPAY_CONFIG.ENABLE_TRACE,
    },
    defaultHeaders
)

const ioBaseUrl = getBaseUrl([DEV, UAT, PROD], 'io')
export function buildIOAuthorizationHeader(fiscalCode) {
    const authToken = loginFullUrl(
        `${ioBaseUrl}/rtd/mock-io/login`,
        fiscalCode,
        IDPAY_CONFIG.AUTH_KEYS.APIM_LOGIN_KEY
    )

    return Object.assign(
        {
            Authorization: `Bearer ${authToken}`,
        },
        idpayDefaultHeaders
    )
}
