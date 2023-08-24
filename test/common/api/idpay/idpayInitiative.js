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


export function deleteInitiative(initiativeId){
    const apiName = INITIATIVE_API_NAMES.deleteInitiative
    
    let url = `${innerBaseUrl}${API_PREFIX}/${initiativeId}`

    const res = http.del(url)
    logResult(apiName, res)
    return res
}