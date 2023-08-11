import { sleep } from 'k6'
import {
    ONBOARDING_API_NAMES,
    checkInitiativeBudget,
} from '../../common/api/idpay/idpayOnboardingCitizen.js'
import { assert, statusOk } from '../../common/assertions.js'
import defaultHandleSummaryBuilder from '../../common/handleSummaryBuilder.js'
import { defaultApiOptionsBuilder } from '../../common/dynamicScenarios/defaultOptions.js'
import { IDPAY_CONFIG } from '../../common/idpay/envVars.js'
import { logErrorResult } from '../../common/dynamicScenarios/utils.js'
import { CONFIG } from '../../common/dynamicScenarios/envVars.js'

// test tags
const application = 'idpay'
const testName = 'idpayOnboardingAPI'

// Dynamic scenarios' K6 configuration
export const options = defaultApiOptionsBuilder(application, testName, [
    ONBOARDING_API_NAMES.checkInitiativeBudget,
])

// K6 summary configuration
export const handleSummary = defaultHandleSummaryBuilder(application, testName)

export default () => {
    const res = checkInitiativeBudget(
        CONFIG.USE_INTERNAL_ACCESS_ENV,
        IDPAY_CONFIG.CONTEXT_DATA.initiativeId
    )

    assert(res, [statusOk()])

    if (res.status != 200) {
        logErrorResult('checkInitiativeBudget', res, true)
        return
    }

    sleep(1)
}
