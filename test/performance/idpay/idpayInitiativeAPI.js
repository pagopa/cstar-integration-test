import { group } from 'k6'
import {
    deleteInitiative,
    INITIATIVE_API_NAMES
} from '../../common/api/idpay/idpayInitiative.js'
import { getFCList, getUserIdsList } from '../../common/utils.js'
import { SharedArray } from 'k6/data'
import defaultHandleSummaryBuilder from '../../common/handleSummaryBuilder.js'
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

// K6 VuIteration scenarios
function scenarioPerVuIteration(startTime, vus) {
    return {
        executor: 'per-vu-iterations',
        vus,
        iterations: CONFIG.SCENARIOS.perVuIterations.ONESHOT,
        startTime: `${startTime}s`,
        maxDuration: `${CONFIG.SCENARIOS.perVuIterations.DURATION}s`,
    }
}

// K6 summary configuration
export const handleSummary = defaultHandleSummaryBuilder(application, testName)

export default () => {

    group('Delete initiative', () => {
        
        const res = deleteInitiative(
            CONFIG.USE_INTERNAL_ACCESS_ENV,
            IDPAY_CONFIG.CONTEXT_DATA.initiativeId
        )

        assert(res, [statusNoContent()])
        if (res.status != 204) {
            logErrorResult('deleteInitiative', res, true)
            return
        }
        
    })
}