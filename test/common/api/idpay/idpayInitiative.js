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

function configureInitiativeRequest(useInnerAccess, initiativeId) {
    let baseUrl
    if (useInnerAccess) {
        baseUrl = `${innerBaseUrl}${API_PREFIX}/${initiativeId}`
    } else {
        throw new Error('Delete Initiative apim invoke not implemented!')   
    }

    return baseUrl
}

export function deleteInitiative(useInnerAccess,initiativeId){
    const apiName = INITIATIVE_API_NAMES.deleteInitiative
    
    let url = configureInitiativeRequest(
        useInnerAccess, 
        initiativeId
        )

    const res = http.del(url)
    logResult(apiName, res)
    return res
}