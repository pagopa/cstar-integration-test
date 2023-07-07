import { loginFullUrl } from '../api/bpdIoLogin.js'
import { defaultHeaders } from '../dynamicScenarios/envVars.js'
import { coalesce } from '../utils/utils.js'

export const IDPAY_CONFIG = {
    CONTEXT_DATA: {
        initiativeId: coalesce(__ENV.INITIATIVE_ID, 'Auto'),
        merchantId: __ENV.MERCHANT_ID,
    },

    ENABLE_TRACE: coalesce(__ENV.ENABLE_TRACE, 'false'),

    AUTH_KEYS: {
        APIM: __ENV.APIM_SK,
    },
}

export const idpayDefaultHeaders = {
    headers: Object.assign(
        {
            'Ocp-Apim-Subscription-Key': IDPAY_CONFIG.AUTH_KEYS.APIM,
            'Ocp-Apim-Trace': IDPAY_CONFIG.ENABLE_TRACE,
        },
        defaultHeaders.headers
    ),
}

export function buildIOAuthorizationHeader(fiscalCode) {
    const authToken = loginFullUrl(
        `${baseUrl}/bpd/pagopa/api/v1/login`,
        fiscalCode
    )

    return Object.assign(
        {
            Authorization: `Bearer ${authToken}`,
        },
        idpayDefaultHeaders
    )
}
