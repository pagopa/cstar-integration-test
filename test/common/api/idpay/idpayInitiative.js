import http from 'k6/http'
import { DEV, UAT, getBaseUrl } from '../../envs.js'
import { logResult } from '../../dynamicScenarios/utils.js'

export const INITIATIVE_API_NAMES = {
    deleteInitiative: 'initiative/delete'
}

// Environments allowed to be tested
const REGISTERED_ENVS = [DEV, UAT]

const innerBaseUrl = `${getBaseUrl(REGISTERED_ENVS, 'internal')}/idpayportalwelfarebackendinitiative`

const API_PREFIX = '/idpay/initiative'

function configureMerchantRequest(useInnerAccess) {
    let baseUrl
    let tokenHeader
    if (useInnerAccess) {
        baseUrl = `${innerBaseUrl}${API_PREFIX}/merchant`
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

export function deleteInitiative(useInnerAccess,initiativeId){
    const apiName = INITIATIVE_API_NAMES.deleteInitiative
    
    let url = `${innerBaseUrl}${API_PREFIX}/${initiativeId}`

    const res = http.del(url)
    logResult(apiName, res)
    return res
}