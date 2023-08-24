import { group } from 'k6'
import {
    deleteInitiative,
    INITIATIVE_API_NAMES
} from '../../common/api/idpay/idpayInitiative.js'
import { getFCList, getUserIdsList } from '../../common/utils.js'
import { SharedArray } from 'k6/data'
import defaultHandleSummaryBuilder from '../../common/handleSummaryBuilder.js'
import { defaultApiOptionsBuilder } from '../../common/dynamicScenarios/defaultOptions.js'
import { CONFIG } from '../../common/dynamicScenarios/envVars.js'
import {
    assert,
    statusNoContent,
} from '../../common/assertions.js'
import { logErrorResult } from '../../common/dynamicScenarios/utils.js'
import {
    IDPAY_CONFIG
} from '../../common/idpay/envVars.js'

// test tags
const application = 'idpay'
const testName = 'idpayInitiativeAPI'

// Set up data for processing, share data among VUs
const usersList = new SharedArray(
    'usersList',
    CONFIG.USE_INTERNAL_ACCESS_ENV ? getUserIdsList : getFCList
)

// Dynamic scenarios' K6 configuration
export const options = defaultApiOptionsBuilder(
    application,
    testName,
    [INITIATIVE_API_NAMES.deleteInitiative] // applying apiName tags to thresholds
)


// K6 summary configuration
export const handleSummary = defaultHandleSummaryBuilder(application, testName)

export default () => {

    group('Delete initiative', () => {
        
        const res = deleteInitiative(
            IDPAY_CONFIG.CONTEXT_DATA.initiativeId
        )
        assert(res, [statusNoContent()])
        if (res.status != 204) {
            logErrorResult('deleteInitiative', res, true)
            return
        }
        
    })
}