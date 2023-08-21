import http from 'k6/http'
import { logResult } from '../../dynamicScenarios/utils.js'
import { DEV, UAT, getBaseUrl } from '../../envs.js'

export const MERCHANT_API_NAMES = {
    retrieveMerchantId: 'merchant/retrieveMerchantId',
}

// Environments allowed to be tested
const REGISTERED_ENVS = [DEV, UAT]

const innerBaseUrl = `${getBaseUrl(REGISTERED_ENVS, 'internal')}/idpaymerchant`
const API_PREFIX = '/idpay/merchant'

export function retrieveMerchantId(
    useInnerAccess,
    acquirerId,
    merchantFiscalCode
) {
    const apiName = MERCHANT_API_NAMES.retrieveMerchantId

    if (!useInnerAccess) {
        throw new Error('Public access to retrieveMerchantId is not supported!')
    }
    const baseUrl = innerBaseUrl

    const res = http.get(
        `${baseUrl}${API_PREFIX}/acquirer/${acquirerId}/merchant-fiscalcode/${merchantFiscalCode}/id`,
        { tags: { apiName } }
    )
    logResult(apiName, res)
    return res
}
