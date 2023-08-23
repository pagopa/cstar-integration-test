import http from 'k6/http'
import { DEV, UAT, getBaseUrl } from '../../envs.js'
import { logResult } from '../../dynamicScenarios/utils.js'

export const INITIATIVE_API_NAMES = {
    deleteInitiative: 'initiative/delete'
}

// Environments allowed to be tested
const REGISTERED_ENVS = [DEV, UAT]

const innerBaseUrl = `${getBaseUrl(REGISTERED_ENVS, 'internal')}/idpayportalwelfarebackendinitiative`
// const apimBaseUrl = getBaseUrl(REGISTERED_ENVS, 'io') // api-io services baseUrl

const API_PREFIX = '/idpay/initiative'


export function deleteInitiative(){
    const apiName = INITIATIVE_API_NAMES.deleteInitiative

    let url = `${innerBaseUrl}${API_PREFIX}/${INITIATIVE_ID}`

    const res = http.delete(url)
    logResult(apiName, res)
    return res
}